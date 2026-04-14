from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.models.time_slot import TimeSlot
from app.auth.dependencies import get_current_user, require_role
from app.schemas.doctor import DoctorCreate
from app.auth.hashing import hash_password

router = APIRouter(prefix="/doctors", tags=["Doctors"])


@router.get("/", response_model=List[dict])
def list_doctors(
    specialty: Optional[str] = None,
    db: Session = Depends(get_db),
    user=Depends(require_role("patient")),
):
    """Return all users with role 'doctor'. Optional specialty filter."""
    query = db.query(User).filter(User.role == "doctor")
    if specialty:
        query = query.filter(User.specialty == specialty)
    doctors = query.all()
    # convert SQLAlchemy objects to dicts
    result = []
    for d in doctors:
        result.append({
            "id": str(d.user_id),
            "email": d.email,
            "first_name": d.first_name,
            "last_name": d.last_name,
            "specialty": d.specialty,
            "status": getattr(d, "status", None),
        })
    return result


@router.get("/{doctor_id}/slots")
def get_slots(
    doctor_id: str,
    date: Optional[str] = None,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Return available time slots for a given doctor. Date may be supplied as YYYY-MM-DD."""
    try:
        did = UUID(doctor_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid doctor_id")

    query = db.query(TimeSlot).filter(TimeSlot.doctor_id == did, TimeSlot.is_available == True)
    if date:
        try:
            target = datetime.fromisoformat(date).date()
            query = query.filter(TimeSlot.start_time.cast("date") == target)
        except ValueError:
            pass
    slots = query.all()
    # Return stable slot IDs from the time_slot table so booking can prefer slot_id over datetime matching.
    return [
        {
            "slot_id": str(slot.slot_id),
            "start_time": slot.start_time.isoformat(),
            "end_time": slot.end_time.isoformat(),
            "time": slot.start_time.strftime("%I:%M %p"),
        }
        for slot in slots
    ]


@router.post("/")
def create_doctor(
    payload: DoctorCreate,
    db: Session = Depends(get_db),
    user=Depends(require_role("admin")),
):
    """Admin can register a new doctor account."""
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        email=payload.email,
        # Never store raw passwords; hash server-side.
        password_hash=hash_password(payload.password),
        role="doctor",
        first_name=payload.name,
        specialty=payload.specialty,
        license_number=payload.license_number,
    )
    db.add(new_user)
    db.commit()
    return {"message": "Doctor created", "id": str(new_user.user_id)}
