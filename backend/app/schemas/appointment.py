from datetime import date
from typing import Optional

from pydantic import BaseModel


class BookingCreate(BaseModel):
    doctor_id: str  # UUID as string
    day: date
    time: str
    appointment_type: Optional[str] = None
    fee: Optional[float] = None
    is_virtual: bool = False
