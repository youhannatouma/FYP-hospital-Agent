from datetime import date
from typing import Optional

from pydantic import BaseModel


class BookingCreate(BaseModel):
    doctor_id: str  # UUID as string
    slot_id: str    # UUID as string
    day: date
    time: str
    appointment_type: Optional[str] = None
    fee: Optional[float] = None
    is_virtual: bool = False


class DoctorBookingCreate(BaseModel):
    patient_id: str  # UUID as string
    date: str        # YYYY-MM-DD
    time: str        # HH:MM AM/PM or HH:MM
    appointment_type: Optional[str] = None
    fee: Optional[float] = None
    notes: Optional[str] = None
