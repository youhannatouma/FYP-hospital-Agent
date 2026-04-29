from sqlalchemy.orm import Session
from app.models.payment import Payment
from app.models.invoice import Invoice
from datetime import datetime
import uuid

class PaymentSkill:
    @staticmethod
    def create_payment_record(db: Session, appointment_id: str, patient_id: str, amount: float, method: str = "Card"):
        payment = Payment(
            appointment_id=uuid.UUID(appointment_id) if isinstance(appointment_id, str) else appointment_id,
            patient_id=uuid.UUID(patient_id) if isinstance(patient_id, str) else patient_id,
            amount=amount,
            payment_method=method,
            status="Pending"
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)
        return payment

    @staticmethod
    def complete_payment(db: Session, payment_id: uuid.UUID, transaction_id: str):
        payment = db.query(Payment).filter(Payment.payment_id == payment_id).first()
        if payment:
            payment.status = "Completed"
            payment.transaction_id = transaction_id
            payment.completed_at = datetime.now()
            
            # If there's an associated invoice, mark it as paid
            # (In a real system, we'd find the invoice by appointment_id or invoice_id)
            invoice = db.query(Invoice).filter(Invoice.appointment_id == payment.appointment_id).first()
            if invoice:
                invoice.status = "Paid"
            
            db.commit()
            db.refresh(payment)
        return payment

    @staticmethod
    def get_patient_payments(db: Session, patient_id: str):
        return db.query(Payment).filter(Payment.patient_id == patient_id).all()

    @staticmethod
    def get_patient_invoices(db: Session, patient_id: str):
        return db.query(Invoice).filter(Invoice.patient_id == patient_id).all()

    @staticmethod
    def create_invoice(db: Session, patient_id: str, description: str, total_amount: float, patient_due: float, provider: str = None, appointment_id: str = None, due_date: datetime = None):
        invoice = Invoice(
            patient_id=uuid.UUID(patient_id) if isinstance(patient_id, str) else patient_id,
            appointment_id=uuid.UUID(appointment_id) if (appointment_id and isinstance(appointment_id, str)) else appointment_id,
            description=description,
            total_amount=total_amount,
            patient_due=patient_due,
            insurance_paid=total_amount - patient_due,
            provider=provider,
            status="Due",
            due_date=due_date
        )
        db.add(invoice)
        db.commit()
        db.refresh(invoice)
        return invoice
