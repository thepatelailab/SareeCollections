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
            # Fallback for Cloud Run with attached service account
            firebase_admin.initialize_app()
except Exception as e:
    print(f"Error initializing Firebase: {e}")

db = firestore.Client()

app = FastAPI(title="SareeDukan Payment API")

# Configure CORS - Explicitly allow common frontend headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
)

# --- Pydantic Models ---

class CreateOrderRequest(BaseModel):
    amount: int = Field(..., ge=100) # Amount in paise
    user_id: str
    items: list[str] = []

# --- Helper Functions ---

def process_successful_payment(user_id: str, amount_paise: int, payment_id: str, order_id: str):
    """
    Updates the order status in Firestore after successful payment.
    """
    order_ref = db.collection("orders").document(order_id)
    
    transaction_data = {
        "payment_id": payment_id,
        "status": "paid",
        "paid_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    try:
        order_ref.update(transaction_data)
        return True
    except Exception as e:
        print(f"Error updating order {order_id}: {e}")
        return False

# --- Endpoints ---

@app.get("/")
async def root():
    return {
        "message": "SareeDukan Payment API is live",
        "status": "online",
        "endpoints": {
            "create_order": "/create-order (POST)",
            "webhook": "/webhook (POST)",
            "health": "/health (GET)"
        }
    }

@app.post("/create-order")
async def create_order(data: CreateOrderRequest):
    if not razorpay_client:
        raise HTTPException(status_code=500, detail="Razorpay not configured on server (Missing API Keys)")
    
    try:
        # 1. Create Order in Razorpay
        receipt_id = f"rcpt_{int(datetime.now(timezone.utc).timestamp())}_{data.user_id[:5]}"
        order_params = {
            "amount": data.amount,
            "currency": "INR",
            "receipt": receipt_id,
            "notes": {
                "user_id": data.user_id,
                "item_count": len(data.items)
            }
        }
        order = razorpay_client.order.create(order_params)
        
        # 2. Pre-create the order record in Firestore
        db.collection("orders").document(order["id"]).set({
            "order_id": order["id"],
            "user_id": data.user_id,
            "amount_paise": data.amount,
            "status": "pending",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "items": data.items,
            "receipt": receipt_id
        })

        return JSONResponse(content=order)
    except Exception as e:
        print(f"Order creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/webhook")
async def webhook_info():
    return {"message": "Webhook endpoint is active. Use POST requests for Razorpay events."}

@app.post("/webhook")
async def webhook(request: Request):
    if not RAZORPAY_WEBHOOK_SECRET:
        raise HTTPException(status_code=500, detail="Webhook secret not configured")
        
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
    except Exception:
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

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)