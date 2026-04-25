from pydantic import BaseModel
from typing import Optional, List
from datetime import date

class UserCreate(BaseModel):
    email: str
    password: str
    role: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserProfileUpdate(BaseModel):
    """Schema for updating current user's profile data."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    blood_type: Optional[str] = None
    allergies: Optional[List[str]] = None
    chronic_conditions: Optional[List[str]] = None
    emergency_contact: Optional[str] = None
    # Doctor fields
    specialty: Optional[str] = None
    license_number: Optional[str] = None
    years_of_experience: Optional[int] = None
    qualifications: Optional[List[str]] = None
    clinic_address: Optional[str] = None
