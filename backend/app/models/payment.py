from sqlalchemy import Column, Text, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.database import Base

class Payment(Base):
    __tablename__ = "payment"

    payment_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    appointment_id = Column(UUID(as_uuid=True), nullable=False)
    patient_id = Column(UUID(as_uuid=True), nullable=False)
    
    amount = Column(Float, nullable=False)
    currency = Column(Text, default="USD")
    status = Column(Text, default="Pending") # Pending, Completed, Refunded
    
    transaction_id = Column(Text) # Stripe/PayPal ID
    payment_method = Column(Text) # Card, Cash, Insurance
    
    created_at = Column(DateTime, default=func.now())
    completed_at = Column(DateTime)
