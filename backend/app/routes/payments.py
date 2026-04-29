from fastapi import APIRouter, Depends, HTTPException
import uuid
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.dependencies import get_current_user
from app.skills.payment_skill import PaymentSkill

router = APIRouter(prefix="/payments", tags=["Payments"])

class PaymentPayload(BaseModel):
    amount: float
    appointmentId: str = None
    invoiceId: str = None
    method: str = "Card"
    token: str = None  # Stripe/Payment Gateway token

@router.post("/")
def process_payment(payload: PaymentPayload, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    
    # In a real system, we'd use the token to charge the customer via Stripe
    # For now, we simulate success if a token is provided.
    if not payload.token:
         # In production, this would be a hard error. 
         # For our current state, we'll allow it but log it.
         print("Warning: Processing payment without token (simulated)")

    # Create the payment record
    payment = PaymentSkill.create_payment_record(
        db, 
        appointment_id=payload.appointmentId,
        patient_id=current_user.id,
        amount=payload.amount,
        method=payload.method
    )
    
    # Simulate gateway transaction ID
    transaction_id = f"tx_{uuid.uuid4().hex[:12]}" if payload.token else "sim_tx_" + str(payment.payment_id)[:8]
    
    # Complete the payment
    PaymentSkill.complete_payment(db, payment.payment_id, transaction_id)
    
    # If there was an invoiceId, we should ensure that specific invoice is updated
    # (PaymentSkill.complete_payment currently looks up by appointment_id)
    
    return {"success": True, "message": "Payment processed and recorded", "payment_id": str(payment.payment_id), "transaction_id": transaction_id}

@router.get("/my")
def get_my_payments(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return PaymentSkill.get_patient_payments(db, current_user.id)

@router.get("/invoices")
def get_my_invoices(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Fetch all invoices for the current patient."""
    invoices = PaymentSkill.get_patient_invoices(db, current_user.id)
    
    # If no invoices exist, we might want to seed some for demo purposes if it's a first-time user
    # but in a real app we just return the empty list.
    return invoices
