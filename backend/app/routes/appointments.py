from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.appointment import Appointment
from app.models.time_slot import TimeSlot  # 🔥 import this
from app.models.enums import AppointmentStatus
from app.auth.dependencies import get_current_user, require_role
from app.models.user import User

router = APIRouter(prefix="/appointments", tags=["Appointments"])


# Patient: view my appointments
@router.get("/my")
def my_appointments(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return db.query(Appointment).filter(Appointment.patient_id == user.user_id).all()


# Doctor: view my appointments
@router.get("/doctor")
def doctor_appointments(
    db: Session = Depends(get_db),
    user: User = Depends(require_role("doctor"))
):
    return db.query(Appointment).filter(Appointment.doctor_id == user.user_id).all()


# Patient: book appointment
@router.post("/book/{slot_id}")
def book_appointment(
    slot_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("patient"))
):
    slot = db.query(TimeSlot).filter(
        TimeSlot.slot_id == slot_id,
        TimeSlot.is_available == True
    ).first()

    if not slot:
        raise HTTPException(status_code=404, detail="Slot not available")

    appointment = Appointment(
        patient_id=user.user_id,
        doctor_id=slot.doctor_id,
        slot_id=slot.slot_id,
        status=AppointmentStatus.scheduled
    )

    slot.is_available = False

    db.add(appointment)
    db.commit()

    return {"message": "Appointment booked", "appointment_id": appointment.appointment_id}


# Cancel
@router.post("/cancel/{appointment_id}")
def cancel_appointment(
    appointment_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    appointment = db.query(Appointment).filter(
        Appointment.appointment_id == appointment_id
    ).first()

    if not appointment:
        raise HTTPException(status_code=404, detail="Not found")

    if appointment.patient_id != user.user_id and appointment.doctor_id != user.user_id:
        raise HTTPException(status_code=403)

    appointment.status = AppointmentStatus.cancelled
    db.commit()

    return {"message": "Appointment cancelled"}


# Reschedule
@router.post("/reschedule/{appointment_id}/{new_slot_id}")
def reschedule(
    appointment_id: str,
    new_slot_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    appointment = db.query(Appointment).filter(
        Appointment.appointment_id == appointment_id
    ).first()

    if not appointment:
        raise HTTPException(status_code=404)

    if appointment.patient_id != user.user_id:
        raise HTTPException(status_code=403)

    slot = db.query(TimeSlot).filter(
        TimeSlot.slot_id == new_slot_id,
        TimeSlot.is_available == True
    ).first()

    if not slot:
        raise HTTPException(status_code=404, detail="Slot not available")

    old_slot = db.query(TimeSlot).filter(TimeSlot.slot_id == appointment.slot_id).first()
    if old_slot:
        old_slot.is_available = True

    appointment.slot_id = slot.slot_id
    slot.is_available = False

    db.commit()

    return {"message": "Rescheduled"}


# Doctor: create slot
@router.post("/slots")
def create_slot(
    start_time,
    end_time,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("doctor"))
):
    slot = TimeSlot(
        doctor_id=user.user_id,
        start_time=start_time,
        end_time=end_time,
        is_available=True
    )

    db.add(slot)
    db.commit()

    return {"message": "slot created", "slot_id": slot.slot_id}