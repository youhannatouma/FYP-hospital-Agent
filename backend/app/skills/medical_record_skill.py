from __future__ import annotations

from uuid import UUID

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
        diagnosis: str,
        treatment: str,
        clinical_notes: str | None = None,
        appointment_id: UUID | None = None,
    ) -> MedicalRecord:
        record = MedicalRecord(
            patient_id=patient_id,
            doctor_id=doctor_id,
            record_type=record_type,
            diagnosis=diagnosis,
            treatment=treatment,
            clinical_notes=clinical_notes,
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
