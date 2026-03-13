from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user, require_role
from app.database import get_db
from app.models.appointment import Appointment
from app.models.enums import AppointmentStatus
from app.models.time_slot import TimeSlot
from app.models.user import User
from app.schemas.appointment import BookingCreate

router = APIRouter(prefix="/appointments", tags=["Appointments"])


# Patient: view my appointments
@router.get("/my")
def my_appointments(
    db: Session = Depends(get_db),
    user: User = Depends(require_role("patient")),
):
    appointments = db.query(Appointment).filter(Appointment.patient_id == user.user_id).all()
    result = []
    for a in appointments:
        doctor = db.query(User).filter(User.user_id == a.doctor_id).first()
        result.append({
            "appointment_id": str(a.appointment_id),
            "doctor_id": str(a.doctor_id),
            "doctor_name": f"{doctor.first_name or ''} {doctor.last_name or ''}".strip(),
            "status": a.status.value,
            "appointment_type": a.appointment_type,
            "fee": float(a.fee) if a.fee is not None else None,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        })
    return result


# Doctor: view my appointments
@router.get("/doctor")
def doctor_appointments(
    db: Session = Depends(get_db),
    user: User = Depends(require_role("doctor")),
):
    appointments = db.query(Appointment).filter(Appointment.doctor_id == user.user_id).all()
    result = []
    for a in appointments:
        patient = db.query(User).filter(User.user_id == a.patient_id).first()
        result.append({
            "appointment_id": str(a.appointment_id),
            "patient_id": str(a.patient_id),
            "patient_name": f"{patient.first_name or ''} {patient.last_name or ''}".strip(),
            "status": a.status.value,
            "appointment_type": a.appointment_type,
            "fee": float(a.fee) if a.fee is not None else None,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        })
    return result


# Patient: book appointment (simple booking used by frontend)
@router.post("/bookings")
def create_booking(
    payload: BookingCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("patient")),
):
    try:
        doctor_id = UUID(payload.doctor_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid doctor_id")

    # Optional: validate doctor exists and has role "doctor"
    doctor = db.query(User).filter(User.user_id == doctor_id, User.role == "doctor").first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # For now we don't use TimeSlot granularity; we just create an appointment record.
    appointment = Appointment(
        patient_id=user.user_id,
        doctor_id=doctor.user_id,
        status=AppointmentStatus.scheduled,
        appointment_type=payload.appointment_type,
        fee=payload.fee,
    )

    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    return {
        "appointment_id": str(appointment.appointment_id),
        "status": appointment.status.value,
    }


# Cancel
@router.patch("/{appointment_id}/cancel")
def cancel_appointment(
    appointment_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    appointment = (
        db.query(Appointment)
        .filter(Appointment.appointment_id == appointment_id)
        .first()
    )

    if not appointment:
        raise HTTPException(status_code=404, detail="Not found")

    if appointment.patient_id != user.user_id and appointment.doctor_id != user.user_id:
        raise HTTPException(status_code=403)

    appointment.status = AppointmentStatus.cancelled
    db.commit()

    return {"message": "Appointment cancelled"}


# Reschedule (frontend sends new date/time but we only track status server-side for now)
@router.patch("/{appointment_id}/reschedule")
def reschedule(
    appointment_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    appointment = (
        db.query(Appointment)
        .filter(Appointment.appointment_id == appointment_id)
        .first()
    )

    if not appointment:
        raise HTTPException(status_code=404, detail="Not found")

    if appointment.patient_id != user.user_id:
        raise HTTPException(status_code=403)

    # In a more complete model we'd update slot/date/time here.
    appointment.status = AppointmentStatus.scheduled
    db.commit()

    return {"message": "Rescheduled"}


# Doctor: mark appointment completed
@router.patch("/{appointment_id}/complete")
def complete_appointment(
    appointment_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("doctor")),
):
    appointment = (
        db.query(Appointment)
        .filter(Appointment.appointment_id == appointment_id)
        .first()
    )

    if not appointment:
        raise HTTPException(status_code=404, detail="Not found")

    if appointment.doctor_id != user.user_id:
        raise HTTPException(status_code=403)

    appointment.status = AppointmentStatus.completed
    db.commit()

    return {"message": "Completed"}


# Doctor: create slot (kept for future use)
@router.post("/slots")
def create_slot(
    start_time: datetime,
    end_time: datetime,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("doctor")),
):
    slot = TimeSlot(
        doctor_id=user.user_id,
        start_time=start_time,
        end_time=end_time,
        is_available=True,
    )

    db.add(slot)
    db.commit()

    return {"message": "slot created", "slot_id": slot.slot_id}