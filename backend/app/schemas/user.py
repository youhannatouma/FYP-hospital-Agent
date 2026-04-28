from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import date

class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    role: str

class UserCreate(UserBase):
    password: Optional[str] = None
    specialty: Optional[str] = None
    license_number: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    specialty: Optional[str] = None
    status: Optional[str] = None

class UserProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    specialty: Optional[str] = None
    clinic_address: Optional[str] = None
    license_number: Optional[str] = None
    years_of_experience: Optional[int] = None
    qualifications: Optional[list] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    blood_type: Optional[str] = None
    allergies: Optional[list] = None
    chronic_conditions: Optional[list] = None

class UserResponse(UserBase):
    user_id: UUID
    status: str

    class Config:
        from_attributes = True
