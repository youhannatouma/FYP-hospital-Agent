from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/payments", tags=["Payments"])

class PaymentPayload(BaseModel):
    amount: float
    appointmentId: str

@router.post("/")
def process_payment(payload: PaymentPayload):
    # stub implementation, always succeed
    return {"success": True, "message": "Payment processed"}
