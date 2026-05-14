from sqlalchemy import Column, Text, Date, DateTime, Integer, ARRAY, Float, event
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import uuid
from typing import Optional

from app.database import Base
from app.models.enums import UserRole


class User(Base):
    """
    User model with support for encryption at rest for sensitive fields.
    
    Encrypted fields (marked with _encrypted suffix in storage):
    - phone_number: PII - contact information
    - emergency_contact: PII - emergency contact details
    - license_number: Professional identifier for doctors
    - clinic_address: PII - clinic location (for doctors)
    
    Password is hashed (not encrypted) using bcrypt.
    """
    
    __tablename__ = "usr"

    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Auth: Clerk (optional) or email/password
    clerk_id = Column(Text, unique=True, nullable=True)
    password_hash = Column(Text, nullable=True)

    email = Column(Text, unique=True, nullable=False)
    first_name = Column(Text)
    last_name = Column(Text)
    phone_number_encrypted = Column(Text, nullable=True, name="phone_number")  # Encrypted PII
    
    # For backwards compatibility during migration
    phone_number_plaintext = Column(Text, nullable=True)

    role = Column(Text, nullable=False)  # 'admin' | 'doctor' | 'patient'

    permissions = Column(ARRAY(Text))          # for admins
    
    specialty = Column(Text)                    # for doctors
    license_number_encrypted = Column(Text, nullable=True, name="license_number")  # Encrypted PII
    years_of_experience = Column(Integer)       # for doctors
    qualifications = Column(ARRAY(Text))        # for doctors
    clinic_address_encrypted = Column(Text, nullable=True, name="clinic_address")  # Encrypted PII
    clinic_latitude = Column(Float)             # optional geodata for distance ranking
    clinic_longitude = Column(Float)            # optional geodata for distance ranking

    date_of_birth = Column(Date)                # for patients
    gender = Column(Text)                       # for patients
    address = Column(Text)                      # for patients - could be encrypted for PII
    patient_latitude = Column(Float)             # optional geodata for distance ranking
    patient_longitude = Column(Float)            # optional geodata for distance ranking
    blood_type = Column(Text)                    # for patients - sensitive medical info
    allergies = Column(ARRAY(Text))              # for patients - sensitive medical info
    chronic_conditions = Column(ARRAY(Text))     # for patients - sensitive medical info
    emergency_contact_encrypted = Column(Text, nullable=True, name="emergency_contact")  # Encrypted PII

    # Account state used by admins (Active, Suspended, Pending, etc.)
    status = Column(Text, default="Active")
    
    # Password management
    password_changed_at = Column(DateTime, nullable=True)  # For password expiration
    failed_login_attempts = Column(Integer, default=0)  # For account lockout

    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime)
    
    def __repr__(self):
        return f"<User(user_id={self.user_id}, email={self.email}, role={self.role})>"


# Encryption hooks for automatic field encryption/decryption
@event.listens_for(User, 'before_insert', propagate=True)
@event.listens_for(User, 'before_update', propagate=True)
def encrypt_sensitive_fields(mapper, connection, target):
    """
    Automatically encrypt sensitive fields before insert/update.
    
    Note: This requires ENCRYPTION_KEY to be set in environment.
    For development without encryption, ENCRYPTION_KEY can be unset
    and encryption will be skipped.
    """
    from app.encryption import get_encryption_manager
    import os
    
    # Skip encryption if ENCRYPTION_KEY not set (development)
    if not os.getenv("ENCRYPTION_KEY"):
        return
    
    try:
        em = get_encryption_manager()
        
        # Encrypt sensitive fields
        if target.phone_number_plaintext:
            target.phone_number_encrypted = em.encrypt(target.phone_number_plaintext)
            target.phone_number_plaintext = None
        
        if target.license_number_encrypted and not target.license_number_encrypted.startswith("gAAAAAB"):
            # If it looks like plaintext, encrypt it
            target.license_number_encrypted = em.encrypt(target.license_number_encrypted)
        
        if target.clinic_address_encrypted and not target.clinic_address_encrypted.startswith("gAAAAAB"):
            target.clinic_address_encrypted = em.encrypt(target.clinic_address_encrypted)
        
        if target.emergency_contact_encrypted and not target.emergency_contact_encrypted.startswith("gAAAAAB"):
            target.emergency_contact_encrypted = em.encrypt(target.emergency_contact_encrypted)
    
    except Exception as e:
        # Log but don't block the operation
        import logging
        logging.getLogger("backend.models").error(f"Field encryption error: {e}")