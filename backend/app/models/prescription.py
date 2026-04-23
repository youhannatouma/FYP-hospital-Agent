from sqlalchemy import Column, Text, Date, DateTime, Boolean, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.database import Base

class Prescription(Base):
    __tablename__ = "prescription"

    prescription_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    doctor_id = Column(UUID(as_uuid=True), nullable=False)
    patient_id = Column(UUID(as_uuid=True), nullable=False)
    record_id = Column(UUID(as_uuid=True), nullable=True) # Linked medical record
    
    status = Column(Text, default="Active") # Active, Expired, Fulfilled
    
    issue_date = Column(Date, default=func.current_date())
    expiry_date = Column(Date)
    
    medications = Column(ARRAY(Text)) # Simple list for now, can be linked to a Medication model later
    instructions = Column(Text)
    
    is_filled = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=func.now())
    deleted_at = Column(DateTime)
