from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional, List
from datetime import date
import re

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(
        min_length=12,
        description="Minimum 12 characters, at least 1 uppercase, 1 lowercase, 1 digit, 1 special character"
    )
    role: str = Field(
        pattern="^(admin|doctor|patient)$",
        description="Must be one of: admin, doctor, patient"
    )
    
    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Enforce strong password policy."""
        if len(v) < 12:
            raise ValueError('Password must be at least 12 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least 1 uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least 1 lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least 1 digit')
        if not re.search(r'[@$!%*?&]', v):
            raise ValueError('Password must contain at least 1 special character (@$!%*?&)')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    """Schema for updating current user's profile data."""
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    phone_number: Optional[str] = Field(None, max_length=20)
    date_of_birth: Optional[date] = None
    gender: Optional[str] = Field(None, max_length=50)
    address: Optional[str] = Field(None, max_length=500)
    blood_type: Optional[str] = Field(None, max_length=10)
    allergies: Optional[List[str]] = None
    chronic_conditions: Optional[List[str]] = None
    current_medications: Optional[List[str]] = None
    emergency_contact: Optional[str] = Field(None, max_length=100)
    # Doctor fields
    specialty: Optional[str] = Field(None, max_length=100)
    license_number: Optional[str] = Field(None, max_length=50)
    years_of_experience: Optional[int] = Field(None, ge=0, le=70)
    qualifications: Optional[List[str]] = None
    clinic_address: Optional[str] = Field(None, max_length=500)
