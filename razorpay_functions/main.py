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
from google.cloud import firestore
import firebase_admin
from firebase_admin import credentials

# --- Configuration & Initialization ---

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET")

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

app = FastAPI(title="SareeDukan Payment API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

# --- Pydantic Models ---

class OrderItem(BaseModel):
    id: str
    name: str
    price: float
    quantity: int = 1

class CreateOrderRequest(BaseModel):
    amount: int = Field(..., ge=100) # Amount in paise
    user_id: str
    items: list[OrderItem] = []

# --- Helper Functions ---

def process_successful_payment(user_id: str, amount_paise: int, payment_id: str, order_id: str):
    order_ref = db.collection("orders").document(order_id)
    
    transaction_data = {
        "payment_id": payment_id,
        "status": "paid",
        "paid_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    try:
        # Get order items to decrement stock
        order_doc = order_ref.get()
        if order_doc.exists:
            order_data = order_doc.to_dict()
            items = order_data.get('items', [])
            for item in items:
                product_id = item.get('id')
                qty = item.get('quantity', 1)
                if product_id:
                    prod_ref = db.collection("SareeCollection").document(product_id)
                    prod_ref.update({"stock": firestore.Increment(-qty)})

        order_ref.update(transaction_data)
        return True
    except Exception as e:
        print(f"Error updating order {order_id} in Firestore: {e}")
        return False

# --- Endpoints ---

@app.get("/")
async def root():
    return {
        "message": "SareeDukan Payment API is live",
        "status": "online",
        "configuration": {
            "razorpay_configured": razorpay_client is not None,
            "public_key": RAZORPAY_KEY_ID # Public part of the key for frontend discovery
        },
        "endpoints": ["/create-order", "/webhook", "/health"]
    }

@app.post("/create-order")
async def create_order(data: CreateOrderRequest):
    if not razorpay_client:
        raise HTTPException(status_code=500, detail="Razorpay client NOT initialized. Check server env variables.")
    
    # --- Stock Validation ---
    out_of_stock_items = []
    for item in data.items:
        product_ref = db.collection("SareeCollection").document(item.id)
        product_doc = product_ref.get()
        if product_doc.exists:
            current_stock = product_doc.to_dict().get('stock', 0)
            if current_stock < item.quantity:
                out_of_stock_items.append(item.name)
        else:
            out_of_stock_items.append(f"{item.name} (Not Found)")

    if out_of_stock_items:
        raise HTTPException(
            status_code=400, 
            detail=f"Out of Stock: {', '.join(out_of_stock_items)}. Please remove these from your cart."
        )

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
            "items": [item.dict() for item in data.items],
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

    if not received_signature:
        raise HTTPException(status_code=400, detail="Signature missing")

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
            user_id=entity["notes"].get("user_id"),
            amount_paise=entity["amount"],
            payment_id=entity["id"],
            order_id=entity["order_id"]
        )
    
    return {"status": "ok"}

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc)}
