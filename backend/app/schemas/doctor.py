from pydantic import BaseModel
from typing import Optional

class DoctorCreate(BaseModel):
    email: str
    password: str
    name: Optional[str] = None
    specialty: Optional[str] = None
    license_number: Optional[str] = None

class StatusUpdate(BaseModel):
    status: str
