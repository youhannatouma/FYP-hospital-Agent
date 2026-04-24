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
        "phone_number": user.phone_number,
        # Doctor-specific
        "specialty": user.specialty,
        "license_number": user.license_number,
        "years_of_experience": user.years_of_experience,
        "qualifications": user.qualifications or [],
        "clinic_address": user.clinic_address,
        # Patient-specific
        "date_of_birth": user.date_of_birth.isoformat() if user.date_of_birth else None,
        "gender": user.gender,
        "address": user.address,
        "blood_type": user.blood_type,
        "allergies": user.allergies or [],
        "chronic_conditions": user.chronic_conditions or [],
        "emergency_contact": user.emergency_contact,
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
            "phone_number": user.phone_number,
        }
    }

@router.get("/stats")
def get_patient_dashboard_stats(
    db: Session = Depends(get_db),
    user: User = Depends(require_role("patient"))
):
    """Return dashboard metrics for the logged-in patient."""
    return StatsSkill.get_patient_stats(db, user.user_id)

@router.get("/")
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
