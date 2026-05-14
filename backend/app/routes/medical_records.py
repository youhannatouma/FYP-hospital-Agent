from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Annotated, List

from app.auth.dependencies import get_current_user, require_role
from app.database import get_db
from app.models.user import User
from app.skills.medical_record_skill import MedicalRecordSkill
from app.skills.error_handling_skill import ErrorHandlingSkill
from pydantic import BaseModel

router = APIRouter(prefix="/medical-records", tags=["Medical Records"])

class MedicalRecordCreate(BaseModel):
    patient_id: str
    record_type: str
    diagnosis: str
    treatment: str
    clinical_notes: str = None
    appointment_id: str = None

@router.post("/")
def create_medical_record(
    payload: MedicalRecordCreate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_role("doctor"))]
):
    try:
        record = MedicalRecordSkill.create_record(
            db=db,
            requester=user,
            patient_id=UUID(payload.patient_id),
            doctor_id=user.user_id,
            record_type=payload.record_type,
            diagnosis=payload.diagnosis,
            treatment=payload.treatment,
            clinical_notes=payload.clinical_notes,
            appointment_id=UUID(payload.appointment_id) if payload.appointment_id else None
        )
        return {"record_id": str(record.record_id), "status": "Created"}
    except Exception as e:
        raise ErrorHandlingSkill.handle(e)

@router.get("/my")
def get_my_records(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)]
):
    try:
        from app.models.medical_record import MedicalRecord
        
        if str(user.role) == "patient":
            records = db.query(MedicalRecord).filter(
                MedicalRecord.patient_id == user.user_id,
                MedicalRecord.deleted_at == None
            ).order_by(MedicalRecord.created_at.desc()).all()
        elif str(user.role) == "doctor":
            records = db.query(MedicalRecord).filter(
                MedicalRecord.doctor_id == user.user_id,
                MedicalRecord.deleted_at == None
            ).order_by(MedicalRecord.created_at.desc()).all()
        else:
            records = []
            
        result = []
        for r in records:
            doctor = db.query(User).filter(User.user_id == r.doctor_id).first()
            patient = db.query(User).filter(User.user_id == r.patient_id).first()
            result.append({
                "record_id": str(r.record_id),
                "patient_id": str(r.patient_id),
                "doctor_id": str(r.doctor_id),
                "doctor_name": f"{doctor.first_name} {doctor.last_name}" if doctor else "Unknown",
                "patient_name": f"{patient.first_name} {patient.last_name}" if patient else "Unknown",
                "record_type": r.record_type,
                "diagnosis": r.diagnosis,
                "treatment": r.treatment,
                "clinical_notes": r.clinical_notes,
                "appointment_id": str(r.appointment_id) if r.appointment_id else None,
                "created_at": r.created_at.isoformat() if r.created_at else None
            })
        return result
    except Exception as e:
        raise ErrorHandlingSkill.handle(e)

@router.get("/{record_id}")
def get_medical_record(
    record_id: str,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)]
):
    try:
        from app.models.medical_record import MedicalRecord
        record = db.query(MedicalRecord).filter(
            MedicalRecord.record_id == UUID(record_id),
            MedicalRecord.deleted_at == None
        ).first()
        
        if not record:
            raise Exception("Record not found")
            
        # Security check
        if str(user.role) == "patient" and record.patient_id != user.user_id:
             raise Exception("Unauthorized access to this record")
             
        doctor = db.query(User).filter(User.user_id == record.doctor_id).first()
        patient = db.query(User).filter(User.user_id == record.patient_id).first()
        
        return {
            "record_id": str(record.record_id),
            "patient_id": str(record.patient_id),
            "doctor_id": str(record.doctor_id),
            "doctor_name": f"{doctor.first_name} {doctor.last_name}" if doctor else "Unknown",
            "patient_name": f"{patient.first_name} {patient.last_name}" if patient else "Unknown",
            "record_type": record.record_type,
            "diagnosis": record.diagnosis,
            "treatment": record.treatment,
            "clinical_notes": record.clinical_notes,
            "vitals": record.vitals,
            "appointment_id": str(record.appointment_id) if record.appointment_id else None,
            "created_at": record.created_at.isoformat() if record.created_at else None
        }
    except Exception as e:
        raise ErrorHandlingSkill.handle(e)

@router.delete("/{record_id}")
def delete_medical_record(
    record_id: str,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)]
):
    try:
        MedicalRecordSkill.delete_record(db, user, UUID(record_id))
        return {"message": "Record deleted"}
    except Exception as e:
        raise ErrorHandlingSkill.handle(e)
