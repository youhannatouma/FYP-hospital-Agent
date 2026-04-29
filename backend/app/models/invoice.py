from sqlalchemy import Column, Text, Float, DateTime, ForeignKey, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.database import Base

class Invoice(Base):
    __tablename__ = "invoice"

    invoice_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), nullable=False)
    appointment_id = Column(UUID(as_uuid=True), nullable=True)
    
    date = Column(Date, default=func.current_date())
    description = Column(Text, nullable=False)
    provider = Column(Text)
    
    total_amount = Column(Float, nullable=False)
    insurance_paid = Column(Float, default=0.0)
    patient_due = Column(Float, nullable=False)
    
    status = Column(Text, default="Due") # Due, Paid, Covered, Cancelled
    due_date = Column(Date)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
