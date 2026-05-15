from __future__ import annotations

from uuid import UUID
from typing import Optional

from sqlalchemy.orm import Session

from app.models.medical_record import MedicalRecord


class MedicalRecordSkill:
    @staticmethod
    def create_record(
        *,
        db: Session,
        requester,
        patient_id: UUID,
        doctor_id: UUID,
        record_type: str,
        title: Optional[str] = None,
        diagnosis: Optional[str] = None,
        treatment: Optional[str] = None,
        clinical_notes: Optional[str] = None,
        vitals: Optional[dict] = None,
        appointment_id: Optional[UUID] = None,
    ) -> MedicalRecord:
        record = MedicalRecord(
            patient_id=patient_id,
            doctor_id=doctor_id,
            record_type=record_type,
            title=title,
            diagnosis=diagnosis,
            treatment=treatment,
            clinical_notes=clinical_notes,
            vitals=vitals,
            appointment_id=appointment_id,
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return record

    @staticmethod
    def delete_record(db: Session, requester, record_id: UUID) -> bool:
        record = (
            db.query(MedicalRecord)
            .filter(MedicalRecord.record_id == record_id, MedicalRecord.deleted_at.is_(None))
            .first()
        )
        if not record:
            return False
        record.deleted_at = __import__("datetime").datetime.utcnow()
        db.commit()
        return True
