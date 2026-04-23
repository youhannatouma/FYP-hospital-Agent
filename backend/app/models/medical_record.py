from sqlalchemy import Column, Text, DateTime, ARRAY, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid

from app.database import Base

class MedicalRecord(Base):
    __tablename__ = "medical_record"

    record_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), nullable=False) # Refers to usr.user_id
    doctor_id = Column(UUID(as_uuid=True), nullable=False)  # Refers to usr.user_id
    
    appointment_id = Column(UUID(as_uuid=True), nullable=True) # Linked appointment
    
    record_type = Column(Text) # e.g., 'Consultation', 'Lab Result', 'Radiology'
    diagnosis = Column(Text)
    treatment = Column(Text)
    clinical_notes = Column(Text)
    
    vitals = Column(JSONB) # Structured data like {bp: '120/80', hr: 72}
    is_reviewed = Column(Boolean, default=False)
    
    attachments = Column(ARRAY(Text)) # URLs to files (S3, etc.)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime)
