from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.auth.dependencies import require_role

router = APIRouter(prefix="/payments", tags=["Payments"])

class PaymentPayload(BaseModel):
    amount: float
    appointmentId: str

@router.post("/")
def process_payment(payload: PaymentPayload, user=Depends(require_role("patient"))):
    # Stub implementation; ensure at least basic request hygiene and auth.
    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    return {"success": True, "message": "Payment processed"}
