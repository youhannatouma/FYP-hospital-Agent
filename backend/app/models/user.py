from sqlalchemy import Column, Text, Date, DateTime, Integer, ARRAY, Enum, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import uuid
import enum

Base = declarative_base()

class UserRole(enum.Enum):
    admin = "admin"
    doctor = "doctor"
    patient = "patient"

class User(Base):
    __tablename__ = "usr"

    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(Text, unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    first_name = Column(Text)
    last_name = Column(Text)
    phone_number = Column(Text)
    preferred_language = Column(Text)
    role = Column(Enum(UserRole), nullable=False)
    permissions = Column(ARRAY(Text))
    specialty = Column(Text)
    license_number = Column(Text)
    years_of_experience = Column(Integer)
    qualifications = Column(ARRAY(Text))
    clinic_address = Column(Text)
    date_of_birth = Column(Date)
    gender = Column(Text)
    address = Column(Text)
    blood_type = Column(Text)
    allergies = Column(ARRAY(Text))
    chronic_conditions = Column(ARRAY(Text))
    emergency_contact = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime)

    __table_args__ = (
        CheckConstraint(
            "(role = 'doctor' AND specialty IS NOT NULL AND license_number IS NOT NULL) OR (role != 'doctor')",
            name='chk_doctor_fields'
        ),
        CheckConstraint(
            "(role = 'patient' AND date_of_birth IS NOT NULL) OR (role != 'patient')",
            name='chk_patient_dob'
        )
    )
