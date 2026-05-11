from datetime import datetime, timedelta
from uuid import UUID
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user, require_role
from app.database import get_db
from app.models.time_slot import TimeSlot
from app.models.user import User
from app.schemas.appointment import BookingCreate, DoctorBookingCreate
from app.skills.booking_skill import BookingSkill
from app.skills.error_handling_skill import ErrorHandlingSkill

router = APIRouter(prefix="/appointments", tags=["Appointments"])

# Patient: view my appointments
@router.get("/my")
def my_appointments(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_role("patient"))],
):
    try:
        appointments = BookingSkill.get_patient_appointments(db, user, user.user_id)
        result = []
        for a in appointments:
            doctor = db.query(User).filter(User.user_id == a.doctor_id).first()
            slot = db.query(TimeSlot).filter(TimeSlot.slot_id == a.slot_id).first() if a.slot_id else None
            result.append({
                "appointment_id": str(a.appointment_id),
                "doctor_id": str(a.doctor_id),
                "doctor_name": f"{doctor.first_name or ''} {doctor.last_name or ''}".strip() if doctor else "Doctor",
                "doctor_specialty": doctor.specialty if doctor else None,
                "status": a.status.value,
                "appointment_type": a.appointment_type,
                "fee": float(a.fee) if a.fee is not None else None,
                "date": slot.start_time.strftime("%b %d, %Y") if slot else None,
                "time": slot.start_time.strftime("%I:%M %p") if slot else None,
                "created_at": a.created_at.isoformat() if a.created_at else None,
                "room_id": str(a.room_id) if a.room_id else None,
            })
        return result
    except Exception as e:
        raise ErrorHandlingSkill.handle(e)


# Doctor: view my appointments
@router.get("/doctor")
def doctor_appointments(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_role("doctor"))],
):
    try:
        appointments = BookingSkill.get_doctor_appointments(db, user, user.user_id)
        result = []
        for a in appointments:
            patient = db.query(User).filter(User.user_id == a.patient_id).first()
            slot = db.query(TimeSlot).filter(TimeSlot.slot_id == a.slot_id).first() if a.slot_id else None
            result.append({
                "appointment_id": str(a.appointment_id),
                "patient_id": str(a.patient_id),
                "patient_name": f"{patient.first_name or ''} {patient.last_name or ''}".strip() if patient else "Patient",
                "patient_email": patient.email if patient else None,
                "status": a.status.value,
                "appointment_type": a.appointment_type,
                "fee": float(a.fee) if a.fee is not None else None,
                "date": slot.start_time.strftime("%b %d, %Y") if slot else None,
                "time": slot.start_time.strftime("%I:%M %p") if slot else None,
                "created_at": a.created_at.isoformat() if a.created_at else None,
                "room_id": str(a.room_id) if a.room_id else None,
            })
        return result
    except Exception as e:
        raise ErrorHandlingSkill.handle(e)


# Patient: book appointment
@router.post("/bookings")
def create_booking(
    payload: BookingCreate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_role("patient"))],
):
    try:
        doctor_id = UUID(payload.doctor_id)
        slot_id = UUID(payload.slot_id)
        
        appointment = BookingSkill.create_appointment(
            db=db, 
            requester=user,
            patient_id=user.user_id, 
            doctor_id=doctor_id, 
            slot_id=slot_id,
            appointment_type=payload.appointment_type or "General", 
            fee=payload.fee or 0.0
        )
        
        return {
            "appointment_id": str(appointment.appointment_id),
            "status": appointment.status.value,
            "room_id": str(appointment.room_id),
        }
    except Exception as e:
        raise ErrorHandlingSkill.handle(e)


# Cancel
@router.patch("/{appointment_id}/cancel")
def cancel_appointment(
    appointment_id: str,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    try:
        BookingSkill.cancel_appointment(db, user, UUID(appointment_id))
        return {"message": "Appointment cancelled"}
    except Exception as e:
        raise ErrorHandlingSkill.handle(e)


# Reschedule
@router.patch("/{appointment_id}/reschedule")
def reschedule_appointment(
    appointment_id: str,
    payload: dict,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    """Reschedule an existing appointment to a new date/time."""
    try:
        from app.skills.authorization_skill import AuthorizationSkill
        from app.skills.validation_skill import ValidationSkill
        from app.skills.transaction_skill import TransactionSkill
        from app.models.appointment import Appointment

        appointment = db.query(Appointment).filter(
            Appointment.appointment_id == UUID(appointment_id)
        ).first()
        ValidationSkill.ensure_exists(appointment, "Appointment")

        # Must be a participant (patient or doctor) or admin
        AuthorizationSkill.authorize_resource_access(
            user, [appointment.patient_id, appointment.doctor_id]
        )

        new_date = payload.get("date")  # "YYYY-MM-DD"
        new_time = payload.get("time")  # "HH:MM AM/PM"

        if not new_date or not new_time:
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail="Both date and time are required")

        with TransactionSkill.run_transaction(db):
            # Re-open the old slot
            old_slot = db.query(TimeSlot).filter(
                TimeSlot.slot_id == appointment.slot_id
            ).first()
            if old_slot:
                old_slot.is_available = True

            # Parse the new datetime
            from datetime import datetime
            try:
                dt_str = f"{new_date} {new_time}"
                # Handle both "09:00 AM" and "09:00" formats
                try:
                    new_dt = datetime.strptime(dt_str, "%Y-%m-%d %I:%M %p")
                except ValueError:
                    new_dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M")
            except ValueError:
                from fastapi import HTTPException
                raise HTTPException(status_code=400, detail="Invalid date/time format")

            # Try to find an available slot at the new time
            from sqlalchemy import cast, Date
            available_slot = db.query(TimeSlot).filter(
                TimeSlot.doctor_id == appointment.doctor_id,
                TimeSlot.start_time == new_dt,
                TimeSlot.is_available == True,
            ).first()

            if available_slot:
                # Use existing slot
                available_slot.is_available = False
                appointment.slot_id = available_slot.slot_id
            else:
                # Create a new slot for the rescheduled time
                import uuid
                new_slot = TimeSlot(
                    slot_id=uuid.uuid4(),
                    doctor_id=appointment.doctor_id,
                    start_time=new_dt,
                    end_time=new_dt.replace(minute=new_dt.minute + 30) if new_dt.minute < 30 else new_dt.replace(hour=new_dt.hour + 1, minute=0),
                    is_available=False,
                )
                db.add(new_slot)
                db.flush()
                appointment.slot_id = new_slot.slot_id

        return {"message": "Appointment rescheduled", "appointment_id": str(appointment_id)}
    except Exception as e:
        raise ErrorHandlingSkill.handle(e)


# Doctor: mark appointment completed
@router.patch("/{appointment_id}/complete")
def complete_appointment(
    appointment_id: str,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_role("doctor"))],
):
    try:
        BookingSkill.complete_appointment(db, user, UUID(appointment_id))
        return {"message": "Completed"}
    except Exception as e:
        raise ErrorHandlingSkill.handle(e)


@router.post("/doctor/bookings")
def create_doctor_booking(
    payload: DoctorBookingCreate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_role("doctor"))],
):
    """Doctor-initiated scheduling: create/find slot and book patient immediately."""
    try:
        from app.models.appointment import Appointment
        from app.models.enums import AppointmentStatus
        from sqlalchemy import func
        import uuid

        doctor_id = user.user_id
        patient_id = UUID(payload.patient_id)

        patient = db.query(User).filter(User.user_id == patient_id).first()
        if not patient:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Patient not found")
        if str(patient.role) != "patient":
            from fastapi import HTTPException
            raise HTTPException(status_code=422, detail="Target user must have patient role")

        dt_str = f"{payload.date} {payload.time}"
        try:
            start_dt = datetime.strptime(dt_str, "%Y-%m-%d %I:%M %p")
        except ValueError:
            start_dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M")
        end_dt = start_dt + timedelta(minutes=30)

        # Reuse available slot if present, else create one.
        slot = db.query(TimeSlot).filter(
            TimeSlot.doctor_id == doctor_id,
            TimeSlot.start_time == start_dt,
            TimeSlot.is_available == True,
        ).first()
        if not slot:
            slot = TimeSlot(
                slot_id=uuid.uuid4(),
                doctor_id=doctor_id,
                start_time=start_dt,
                end_time=end_dt,
                is_available=True,
            )
            db.add(slot)
            db.flush()

        appointment = Appointment(
            patient_id=patient_id,
            doctor_id=doctor_id,
            slot_id=slot.slot_id,
            status=AppointmentStatus.scheduled,
            appointment_type=payload.appointment_type or "Consultation",
            fee=payload.fee or 0.0,
            room_id=uuid.uuid4(),
        )
        slot.is_available = False
        db.add(appointment)
        db.commit()
        db.refresh(appointment)

        return {
            "appointment_id": str(appointment.appointment_id),
            "patient_id": str(patient.user_id),
            "patient_name": f"{patient.first_name or ''} {patient.last_name or ''}".strip() or "Patient",
            "status": appointment.status.value,
            "appointment_type": appointment.appointment_type,
            "fee": float(appointment.fee) if appointment.fee is not None else None,
            "date": start_dt.strftime("%b %d, %Y"),
            "time": start_dt.strftime("%I:%M %p"),
            "created_at": appointment.created_at.isoformat() if appointment.created_at else None,
            "room_id": str(appointment.room_id) if appointment.room_id else None,
            "notes": payload.notes or None,
            "slot_id": str(slot.slot_id),
        }
    except Exception as e:
        raise ErrorHandlingSkill.handle(e)
