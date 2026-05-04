from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.dependencies import get_current_user
from app.skills.payment_skill import PaymentSkill

router = APIRouter(prefix="/payments", tags=["Payments"])

class PaymentPayload(BaseModel):
    amount: float
    appointmentId: str
    method: str = "Card"

@router.post("/")
def process_payment(payload: PaymentPayload, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    
    # Create the payment record
    payment = PaymentSkill.create_payment_record(
        db, 
        appointment_id=payload.appointmentId,
        patient_id=current_user.user_id,
        amount=payload.amount,
        method=payload.method
    )
    
    # In a real integration, we'd call Stripe here and get a transaction ID.
    # We'll simulate a successful completion.
    PaymentSkill.complete_payment(db, payment.payment_id, "sim_tx_" + str(payment.payment_id)[:8])
    
    return {"success": True, "message": "Payment processed and recorded", "payment_id": str(payment.payment_id)}

@router.get("/my")
def get_my_payments(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return PaymentSkill.get_patient_payments(db, current_user.user_id)
