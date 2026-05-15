from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Annotated
from app.database import get_db
from app.models.user import User
from app.auth.dependencies import get_current_user, require_role
from app.skills.stats_skill import StatsSkill
from app.schemas.user import UserProfileUpdate

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me")
def get_my_profile(
    user: User = Depends(get_current_user),
):
    """Return the current authenticated user's full profile from the database."""
    return {
        "user_id": str(user.user_id),
        "clerk_id": user.clerk_id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role,
        "status": user.status,
        "phone_number": user.phone_number_plaintext,
        # Doctor-specific
        "specialty": user.specialty,
        "license_number": user.license_number_encrypted,
        "years_of_experience": user.years_of_experience,
        "qualifications": user.qualifications or [],
        "clinic_address": user.clinic_address_encrypted,
        # Patient-specific
        "date_of_birth": user.date_of_birth.isoformat() if user.date_of_birth else None,
        "gender": user.gender,
        "address": user.address,
        "blood_type": user.blood_type,
        "allergies": user.allergies or [],
        "chronic_conditions": user.chronic_conditions or [],
        "emergency_contact": user.emergency_contact_encrypted,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }

@router.patch("/me")
def update_my_profile(
    payload: UserProfileUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Update the current user's profile data."""
    update_data = payload.dict(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(user, field):
            setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return {
        "message": "Profile updated", 
        "user_id": str(user.user_id),
        "user": {
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone_number": user.phone_number_plaintext,
        }
    }

@router.get("/stats")
def get_patient_dashboard_stats(
    db: Session = Depends(get_db),
    user: User = Depends(require_role("patient"))
):
    """Return dashboard metrics for the logged-in patient."""
    return StatsSkill.get_patient_stats(db, user.user_id)


@router.post("/seed-my-account")
def seed_my_account(
    db: Session = Depends(get_db),
    user: User = Depends(require_role("patient"))
):
    """
    Populate the authenticated patient's account with rich sample clinical data.
    Idempotent: if data already exists, returns current counts without duplicating.
    Useful for newly registered Clerk users who need real data visible in the dashboard.
    """
    import random
    from datetime import datetime, timedelta, date
    from uuid import uuid4
    from app.models.medical_record import MedicalRecord
    from app.models.prescription import Prescription
    from app.models.appointment import Appointment
    from app.models.time_slot import TimeSlot
    from app.models.health_goal import HealthGoal
    from app.models.enums import AppointmentStatus

    # Check if user already has data — idempotency guard
    existing_count = db.query(MedicalRecord).filter(
        MedicalRecord.patient_id == user.user_id,
        MedicalRecord.deleted_at == None
    ).count()
    if existing_count >= 5:
        total_appts = db.query(Appointment).filter(Appointment.patient_id == user.user_id).count()
        return {
            "message": "Account already has data",
            "records": existing_count,
            "appointments": total_appts,
            "seeded": False
        }

    # Find available doctors to link the records to
    doctors = db.query(User).filter(User.role == "doctor").limit(5).all()
    if not doctors:
        return {"message": "No doctors found in the system. Run seed_massive_data.py first.", "seeded": False}

    DIAGNOSES = [
        ("Hypertension — Stage 1", "Lisinopril 10mg, low-sodium diet, regular monitoring."),
        ("Type 2 Diabetes — Controlled", "Metformin 500mg BID, blood glucose monitoring, dietary adjustments."),
        ("Acute Bronchitis", "Amoxicillin 500mg TID, rest, increased fluid intake."),
        ("Vitamin D Deficiency", "Vitamin D3 5000 IU daily, sun exposure guidance."),
        ("Lower Back Pain — Mechanical", "NSAIDs, physiotherapy referral, core strengthening exercises."),
        ("Seasonal Allergic Rhinitis", "Cetirizine 10mg OD, nasal saline rinse, allergen avoidance."),
        ("Hyperlipidemia", "Atorvastatin 20mg, dietary modification, exercise prescription."),
        ("Annual Wellness Check", "All vitals within normal range. Vaccinations up to date."),
    ]
    RECORD_TYPES = ["Consultation", "Lab Result", "Follow-up", "Imaging", "Vaccination"]

    records_created = 0
    appts_created = 0

    for i in range(8):
        doc = doctors[i % len(doctors)]
        past_date = datetime.now() - timedelta(days=random.randint(10, 700))
        diag, treatment = DIAGNOSES[i]
        record_type = RECORD_TYPES[i % len(RECORD_TYPES)]

        # Update patient profile on first iteration if empty
        if i == 0 and not user.date_of_birth:
            user.date_of_birth = date(1990, 3, 15)
            user.gender = "Female"
            user.blood_type = "O+"
            user.allergies = ["Penicillin"]
            user.chronic_conditions = ["Hypertension"]
            db.flush()

        record = MedicalRecord(
            patient_id=user.user_id,
            doctor_id=doc.user_id,
            record_type=record_type,
            title=f"{record_type}: {diag.split('—')[0].strip()}",
            diagnosis=diag,
            treatment=treatment,
            clinical_notes=f"Patient presenting with {diag.split('—')[0].strip().lower()}. Vitals reviewed. Treatment plan discussed and agreed upon.",
            vitals={
                "systolic": random.randint(110, 145),
                "diastolic": random.randint(70, 92),
                "heart_rate": random.randint(60, 100),
                "oxygen": random.randint(96, 100),
                "temperature": round(random.uniform(36.2, 37.5), 1),
                "weight": random.randint(60, 90),
            },
            created_at=past_date,
        )
        db.add(record)
        db.flush()
        records_created += 1

        # Add prescription for half the records
        if i % 2 == 0:
            med_name = treatment.split(",")[0].strip()
            presc = Prescription(
                patient_id=user.user_id,
                doctor_id=doc.user_id,
                record_id=record.record_id,
                medications=[med_name],
                instructions="Take as directed by your physician.",
                expiry_date=date.today() + timedelta(days=90),
                status="Active",
                created_at=past_date,
            )
            db.add(presc)

        # Past appointment for this record
        slot = TimeSlot(
            doctor_id=doc.user_id,
            start_time=past_date,
            end_time=past_date + timedelta(minutes=30),
            is_available=False,
        )
        db.add(slot)
        db.flush()
        appt = Appointment(
            patient_id=user.user_id,
            doctor_id=doc.user_id,
            slot_id=slot.slot_id,
            status=AppointmentStatus.completed,
            appointment_type="Clinic Visit",
            fee=float(random.randint(100, 300)),
            room_id=uuid4(),
            created_at=past_date - timedelta(days=7),
        )
        db.add(appt)
        appts_created += 1

    # Add 2 upcoming appointments
    for k in range(2):
        doc = doctors[k % len(doctors)]
        future_dt = datetime.now() + timedelta(days=random.randint(3, 21))
        future_slot = TimeSlot(
            doctor_id=doc.user_id,
            start_time=future_dt.replace(hour=10 + k, minute=0),
            end_time=future_dt.replace(hour=10 + k, minute=30),
            is_available=False,
        )
        db.add(future_slot)
        db.flush()
        future_appt = Appointment(
            patient_id=user.user_id,
            doctor_id=doc.user_id,
            slot_id=future_slot.slot_id,
            status=AppointmentStatus.scheduled,
            appointment_type=random.choice(["Clinic Visit", "Video Consultation"]),
            fee=float(random.randint(150, 400)),
            room_id=uuid4(),
        )
        db.add(future_appt)
        appts_created += 1

    # Add 3 health goals
    GOALS = [
        ("Reduce Blood Pressure", "weight", "130/80", "145/95", 45),
        ("Daily Step Count", "steps", "10000", "4000", 40),
        ("Improve Sleep Quality", "sleep", "8hrs", "5hrs", 60),
    ]
    for title, category, target, current, pct in GOALS:
        goal = HealthGoal(
            patient_id=user.user_id,
            title=title,
            description="Health optimization target set during consultation.",
            target_value=target,
            current_value=current,
            category=category,
            status="In Progress",
            progress_percentage=pct,
        )
        db.add(goal)

    db.commit()
    return {
        "message": "Account seeded successfully",
        "records": records_created,
        "appointments": appts_created,
        "seeded": True,
    }

@router.get("")
def get_users(
    db: Annotated[Session, Depends(get_db)], 
    user: Annotated[User, Depends(require_role(["admin", "doctor"]))]
):
    """Admin and Doctors can list users. Doctors use this to find patients."""
    return db.query(User).all()


@router.patch("/{user_id}/status", responses={404: {"description": "User not found"}})
def update_status(
    user_id: str, 
    payload: dict, 
    db: Annotated[Session, Depends(get_db)], 
    admin: Annotated[User, Depends(require_role("admin"))]
):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if "status" in payload:
        user.status = payload["status"]
        db.commit()
    return {"user_id": user_id, "status": user.status}


@router.delete("/{user_id}", responses={404: {"description": "User not found"}})
def delete_user(
    user_id: str, 
    db: Annotated[Session, Depends(get_db)], 
    admin: Annotated[User, Depends(require_role("admin"))]
):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}
