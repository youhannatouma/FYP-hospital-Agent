from __future__ import annotations

from datetime import date, timedelta
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.prescription import Prescription


class PrescriptionSkill:
    @staticmethod
    def create_prescription(
        *,
        db: Session,
        requester,
        doctor_id: UUID,
        patient_id: UUID,
        medications: list[str],
        instructions: str,
        record_id: UUID | None = None,
        days_valid: int = 30,
    ) -> Prescription:
        expiry = date.today() + timedelta(days=max(days_valid, 1))
        prescription = Prescription(
            doctor_id=doctor_id,
            patient_id=patient_id,
            record_id=record_id,
            medications=medications,
            instructions=instructions,
            expiry_date=expiry,
        )
        db.add(prescription)
        db.commit()
        db.refresh(prescription)
        return prescription

    @staticmethod
    def get_patient_prescriptions(db: Session, requester, patient_id: UUID) -> list[Prescription]:
        return (
            db.query(Prescription)
            .filter(Prescription.patient_id == patient_id, Prescription.deleted_at.is_(None))
            .all()
        )

    @staticmethod
    def delete_prescription(db: Session, requester, prescription_id: UUID) -> bool:
        prescription = (
            db.query(Prescription)
            .filter(Prescription.prescription_id == prescription_id, Prescription.deleted_at.is_(None))
            .first()
        )
        if not prescription:
            return False
        prescription.deleted_at = __import__("datetime").datetime.utcnow()
        db.commit()
        return True
