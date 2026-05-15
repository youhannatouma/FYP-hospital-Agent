from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.models.time_slot import TimeSlot
from app.auth.dependencies import require_role
from app.schemas.doctor import DoctorCreate
from app.auth.hashing import hash_password
from app.skills.stats_skill import StatsSkill
from app.skills.error_handling_skill import ErrorHandlingSkill
from app.skills.clerk_sync_skill import ClerkSyncSkill
from app.models.appointment import Appointment

router = APIRouter(prefix="/doctors", tags=["Doctors"])

@router.get("/stats")
def get_doctor_dashboard_stats(
    db: Session = Depends(get_db),
    user: User = Depends(require_role("doctor"))
):
    """Return dashboard metrics for the logged-in doctor."""
    try:
        return StatsSkill.get_doctor_stats(db, user.user_id)
    except Exception as e:
        raise ErrorHandlingSkill.handle(e)

@router.get("/recent-patients")
def get_recent_patients(
    db: Session = Depends(get_db),
    user: User = Depends(require_role("doctor"))
):
    """Return unique patients seen by this doctor recently."""
    try:
        # Logic: Get unique patient_ids from recent appointments
        recent_patient_ids = db.query(Appointment.patient_id)\
            .filter(Appointment.doctor_id == user.user_id)\
            .distinct()\
            .limit(10)\
            .all()
        
        ids = [pid[0] for pid in recent_patient_ids]
        patients = db.query(User).filter(User.user_id.in_(ids)).all()
        
        return [
            {
                "user_id": str(p.user_id),
                "first_name": p.first_name,
                "last_name": p.last_name,
                "avatar_url": None,
                "role": str(p.role),
                "last_active": p.updated_at.isoformat() if p.updated_at else None
            }
            for p in patients
        ]
    except Exception as e:
        raise ErrorHandlingSkill.handle(e)

@router.get("", response_model=List[dict])
def list_doctors(
    specialty: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Return all users with role 'doctor'. Optional specialty filter."""
    try:
        from app.auth.dependencies import clerk

        # [PERFORMANCE FIX] Syncing all users from Clerk synchronously on every GET request 
        # causes massive latency (slow loading). In production, this should be handled 
        # via Clerk Webhooks or a background task. 
        # try:
        #     ClerkSyncSkill.sync_all_users(db, clerk, roles={"doctor"})
        # except Exception as sync_error:
        #     print(f"[DOCTORS] Clerk doctor sync skipped: {sync_error}")

        query = db.query(User).filter(User.role == "doctor", User.status == "Active")
        if specialty:
            query = query.filter(User.specialty == specialty)
        doctors = query.all()
        result = []
        for d in doctors:
            result.append({
                "id": str(d.user_id),
                "email": d.email,
                "first_name": d.first_name,
                "last_name": d.last_name,
                "specialty": d.specialty,
                "license_number": d.license_number,
                "years_of_experience": d.years_of_experience,
                "qualifications": d.qualifications or [],
                "clinic_address": d.clinic_address,
                "phone_number": d.phone_number,
                "status": d.status,
            })
        return result
    except Exception as e:
        raise ErrorHandlingSkill.handle(e)

@router.get("/{doctor_id}")
def get_doctor(
    doctor_id: str,
    db: Session = Depends(get_db),
):
    """Return a single doctor's profile by ID."""
    try:
        did = UUID(doctor_id)
        doctor = db.query(User).filter(User.user_id == did, User.role == "doctor").first()
        if not doctor:
             from app.skills.validation_skill import ValidationSkill
             ValidationSkill.ensure_exists(None, "Doctor")

        return {
            "id": str(doctor.user_id),
            "email": doctor.email,
            "first_name": doctor.first_name,
            "last_name": doctor.last_name,
            "specialty": doctor.specialty,
            "license_number": doctor.license_number,
            "years_of_experience": doctor.years_of_experience,
            "qualifications": doctor.qualifications or [],
            "clinic_address": doctor.clinic_address,
            "phone_number": doctor.phone_number,
            "status": doctor.status,
        }
    except Exception as e:
        raise ErrorHandlingSkill.handle(e)

@router.get("/{doctor_id}/slots")
def get_slots(
    doctor_id: str,
    date: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Return available time slots for a given doctor."""
    try:
        did = UUID(doctor_id)
        query = db.query(TimeSlot).filter(TimeSlot.doctor_id == did, TimeSlot.is_available == True)
        if date:
            try:
                target = datetime.fromisoformat(date).date()
                from sqlalchemy import cast, Date
                query = query.filter(cast(TimeSlot.start_time, Date) == target)
            except ValueError:
                pass
        
        slots = query.order_by(TimeSlot.start_time).all()
        return [
            {
                "slot_id": str(slot.slot_id),
                "start_time": slot.start_time.isoformat(),
                "end_time": slot.end_time.isoformat(),
                "time": slot.start_time.strftime("%I:%M %p"),
            }
            for slot in slots
        ]
    except Exception as e:
        raise ErrorHandlingSkill.handle(e)

@router.post("")
def create_doctor(
    payload: DoctorCreate,
    db: Session = Depends(get_db),
    user=Depends(require_role("admin")),
):
    """Admin can register a new doctor account."""
    try:
        existing = db.query(User).filter(User.email == payload.email).first()
        if existing:
            raise ValueError("Email already registered")

        new_user = User(
            email=payload.email,
            password_hash=hash_password(payload.password) if payload.password else None,
            role="doctor",
            first_name=payload.name.split(' ')[0] if ' ' in payload.name else payload.name,
            last_name=payload.name.split(' ')[1] if ' ' in payload.name else "",
            specialty=payload.specialty,
            license_number=payload.license_number,
            status="Active"
        )
        db.add(new_user)
        db.commit()
        return {"message": "Doctor created", "id": str(new_user.user_id)}
    except Exception as e:
        raise ErrorHandlingSkill.handle(e)
