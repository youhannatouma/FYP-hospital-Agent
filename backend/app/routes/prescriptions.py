from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Annotated

from app.auth.dependencies import get_current_user, require_role
from app.database import get_db
from app.models.user import User
from app.skills.prescription_skill import PrescriptionSkill
from app.skills.error_handling_skill import ErrorHandlingSkill
from pydantic import BaseModel

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])

class PrescriptionCreate(BaseModel):
    patient_id: str
    medications: list[str]
    instructions: str
    record_id: str = None
    days_valid: int = 30

@router.post("/")
def create_prescription(
    payload: PrescriptionCreate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_role("doctor"))]
):
    try:
        prescription = PrescriptionSkill.create_prescription(
            db=db,
            requester=user,
            doctor_id=user.user_id,
            patient_id=UUID(payload.patient_id),
            medications=payload.medications,
            instructions=payload.instructions,
            record_id=UUID(payload.record_id) if payload.record_id else None,
            days_valid=payload.days_valid
        )
        return {"prescription_id": str(prescription.prescription_id), "status": "Issued"}
    except Exception as e:
        raise ErrorHandlingSkill.handle(e)

@router.get("/my")
def get_my_prescriptions(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)]
):
    try:
        if str(user.role) == "patient":
            prescriptions = PrescriptionSkill.get_patient_prescriptions(db, user, user.user_id)
        elif str(user.role) == "doctor":
             from app.models.prescription import Prescription
             prescriptions = db.query(Prescription).filter(Prescription.doctor_id == user.user_id, Prescription.deleted_at == None).all()
        else:
            prescriptions = []

        result = []
        for p in prescriptions:
            doctor = db.query(User).filter(User.user_id == p.doctor_id).first()
            result.append({
                "prescription_id": str(p.prescription_id),
                "doctor_name": f"Dr. {doctor.first_name} {doctor.last_name}" if doctor else "Doctor",
                "medications": p.medications,
                "instructions": p.instructions,
                "issue_date": p.issue_date.isoformat() if hasattr(p, 'issue_date') and p.issue_date else (p.created_at.isoformat() if p.created_at else None),
                "expiry_date": p.expiry_date.isoformat() if p.expiry_date else None,
                "status": p.status if hasattr(p, 'status') else "Active",
                "is_filled": p.is_filled if hasattr(p, 'is_filled') else False
            })
        return result
    except Exception as e:
        raise ErrorHandlingSkill.handle(e)

@router.delete("/{prescription_id}")
def delete_prescription(
    prescription_id: str,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)]
):
    try:
        PrescriptionSkill.delete_prescription(db, user, UUID(prescription_id))
        return {"message": "Prescription deleted"}
    except Exception as e:
        raise ErrorHandlingSkill.handle(e)

