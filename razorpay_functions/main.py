from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import os
import hmac
import hashlib
import json
from datetime import datetime, timezone
import razorpay
import resend
from google.cloud import firestore
import firebase_admin
from firebase_admin import credentials

# --- Configuration & Initialization ---

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET")
RESEND_API_KEY = os.getenv("RESEND_API_KEY")

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

# Initialize Razorpay Client
razorpay_client = None
if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
    razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

# Initialize Firebase Admin
try:
    if not firebase_admin._apps:
        firebase_creds_json = os.getenv('FIREBASE_CREDENTIALS_JSON')
        if firebase_creds_json:
            cred_dict = json.loads(firebase_creds_json)
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
        else:
            firebase_admin.initialize_app()
except Exception as e:
    print(f"CRITICAL: Error initializing Firebase: {e}")

db = firestore.Client()

app = FastAPI(title="SareeDukan Payment & Fulfilment API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

# --- Pydantic Models ---

class CreateOrderRequest(BaseModel):
    amount: int = Field(..., ge=100) # Amount in paise
    user_id: str
    items: list[dict] = [] # List of {id, name, ownerId, price}
    shipping_details: dict = {}

# --- Helper Functions ---

def send_fulfillment_emails(order_id: str, buyer_email: str, buyer_name: str, items: list, shipping: dict):
    if not RESEND_API_KEY:
        print("Resend API key missing. Skipping emails.")
        return

    # Fetch verified sender from Firestore
    settings_ref = db.collection("settings").document("email")
    settings = settings_ref.get().to_dict() or {}
    sender = settings.get("verifiedEmail", "onboarding@resend.dev")

    # 1. Email to Buyer
    try:
        resend.Emails.send({
            "from": f"SareeDukan <{sender}>",
            "to": buyer_email,
            "subject": f"Acquisition Confirmed: Order #{order_id[:8]}",
            "html": f"""
                <h1>Heritage Acquisition Confirmed</h1>
                <p>Namaste {buyer_name},</p>
                <p>Your order for {len(items)} masterpiece(s) has been successfully placed.</p>
                <p>Status: <strong>Paid</strong></p>
                <p>Our artisans and regional partners are preparing your shipment.</p>
            """
        })
    except Exception as e:
        print(f"Failed to send buyer email: {e}")

    # 2. Emails to Partners (One per unique ownerId)
    partners = {}
    for item in items:
        oid = item.get('ownerId')
        if oid:
            if oid not in partners: partners[oid] = []
            partners[oid].append(item['name'])

    for partner_id, item_names in partners.items():
        partner_doc = db.collection("users").document(partner_id).get()
        if partner_doc.exists:
            p_email = partner_doc.to_dict().get('email')
            if p_email:
                try:
                    resend.Emails.send({
                        "from": f"SareeDukan Operations <{sender}>",
                        "to": p_email,
                        "subject": "New Fulfillment Request - SareeDukan.Com",
                        "html": f"""
                            <h2>New Sale Alert!</h2>
                            <p>You have a new order to fulfill.</p>
                            <p><strong>Items:</strong> {', '.join(item_names)}</p>
                            <p><strong>Ship To:</strong><br/>
                            {shipping.get('name')}<br/>
                            {shipping.get('address')}, {shipping.get('city')} - {shipping.get('zip')}
                            </p>
                            <p>Please log in to your dashboard to select a courier and update tracking.</p>
                        """
                    })
                except Exception as e:
                    print(f"Failed to send partner email: {e}")

def process_successful_payment(order_id: str, payment_id: str):
    order_ref = db.collection("orders").document(order_id)
    order_doc = order_ref.get()
    
    if not order_doc.exists:
        return

    order_data = order_doc.to_dict()
    
    transaction_data = {
        "payment_id": payment_id,
        "status": "paid",
        "paid_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    try:
        order_ref.update(transaction_data)
        
        # Send notifications
        send_fulfillment_emails(
            order_id=order_id,
            buyer_email=order_data.get('email', ''),
            buyer_name=order_data.get('shipping_details', {}).get('name', 'Guest'),
            items=order_data.get('items', []),
            shipping=order_data.get('shipping_details', {})
        )
        return True
    except Exception as e:
        print(f"Error processing success for {order_id}: {e}")
        return False

# --- Endpoints ---

@app.get("/")
async def root():
    return {
        "message": "SareeDukan Operations API is live",
        "configuration": {
            "razorpay_configured": razorpay_client is not None,
            "resend_configured": RESEND_API_KEY is not None,
            "public_key": RAZORPAY_KEY_ID
        }
    }

@app.post("/create-order")
async def create_order(data: CreateOrderRequest):
    if not razorpay_client:
        raise HTTPException(status_code=500, detail="Razorpay client NOT initialized.")
    
    try:
        receipt_id = f"rcpt_{int(datetime.now(timezone.utc).timestamp())}_{data.user_id[:5]}"
        
        order_params = {
            "amount": data.amount,
            "currency": "INR",
            "receipt": receipt_id,
            "notes": {
                "user_id": data.user_id
            }
        }
        
        order = razorpay_client.order.create(order_params)
        
        db.collection("orders").document(order["id"]).set({
            "order_id": order["id"],
            "user_id": data.user_id,
            "amount_paise": data.amount,
            "status": "pending",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "items": data.items,
            "shipping_details": data.shipping_details,
            "email": data.shipping_details.get('email', ''),
            "receipt": receipt_id
        })

        return JSONResponse(content=order)
    except Exception as e:
        print(f"Order creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/webhook")
async def webhook(request: Request):
    if not RAZORPAY_WEBHOOK_SECRET:
        raise HTTPException(status_code=500, detail="RAZORPAY_WEBHOOK_SECRET not configured")
        
    body = await request.body()
    received_signature = request.headers.get("X-Razorpay-Signature")

    try:
        razorpay_client.utility.verify_webhook_signature(
            body.decode('utf-8'), 
            received_signature, 
            RAZORPAY_WEBHOOK_SECRET
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid signature")

    payload = json.loads(body)
    
    if payload.get("event") == "payment.captured":
        entity = payload["payload"]["payment"]["entity"]
        process_successful_payment(
            order_id=entity["order_id"],
            payment_id=entity["id"]
        )
    
    return {"status": "ok"}

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc)}