from __future__ import annotations

from datetime import datetime
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.payment import Payment


class PaymentSkill:
    @staticmethod
    def create_payment_record(
        db: Session,
        *,
        appointment_id: str | UUID,
        patient_id: str | UUID,
        amount: float,
        method: str = "Card",
    ) -> Payment:
        payment = Payment(
            appointment_id=appointment_id,
            patient_id=patient_id,
            amount=amount,
            payment_method=method,
            status="Pending",
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)
        return payment

    @staticmethod
    def complete_payment(db: Session, payment_id: str | UUID, transaction_id: str) -> Payment | None:
        payment = db.query(Payment).filter(Payment.payment_id == payment_id).first()
        if not payment:
            return None
        payment.status = "Completed"
        payment.transaction_id = transaction_id
        payment.completed_at = datetime.utcnow()
        db.commit()
        db.refresh(payment)
        return payment

    @staticmethod
    def get_patient_payments(db: Session, patient_id: str | UUID) -> list[Payment]:
        return (
            db.query(Payment)
            .filter(Payment.patient_id == patient_id)
            .order_by(Payment.created_at.desc())
            .all()
        )
