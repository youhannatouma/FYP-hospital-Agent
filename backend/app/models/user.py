from sqlalchemy import Column, Text, Date, DateTime, Integer, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import uuid

from app.database import Base
from app.models.enums import UserRole


class User(Base):
    __tablename__ = "usr"

    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Auth: Clerk (optional) or email/password
    clerk_id = Column(Text, unique=True, nullable=True)
    password_hash = Column(Text, nullable=True)

    email = Column(Text, unique=True, nullable=False)
    first_name = Column(Text)
    last_name = Column(Text)
    phone_number = Column(Text)
    preferred_language = Column(Text)

    role = Column(Text, nullable=False)  # 'admin' | 'doctor' | 'patient'

    permissions = Column(ARRAY(Text))          # for admins
    
    specialty = Column(Text)                    # for doctors
    license_number = Column(Text)               # for doctors
    years_of_experience = Column(Integer)       # for doctors
    qualifications = Column(ARRAY(Text))        # for doctors
    clinic_address = Column(Text)               # for doctors

    date_of_birth = Column(Date)                # for patients
    gender = Column(Text)                       # for patients
    address = Column(Text)                       # for patients
    blood_type = Column(Text)                    # for patients
    allergies = Column(ARRAY(Text))              # for patients
    chronic_conditions = Column(ARRAY(Text))     # for patients
    emergency_contact = Column(Text)             # for patients

    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime)