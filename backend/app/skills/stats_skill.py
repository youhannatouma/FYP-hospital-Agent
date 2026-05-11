# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
from sqlalchemy import func
from typing import Any
from app.models.appointment import Appointment
from app.models.medical_record import MedicalRecord
from app.models.prescription import Prescription


class StatsSkill:
    @staticmethod
    def get_patient_stats(db: Session, user_id: Any) -> dict:
        """
        Gathers real-time telemetry for the patient dashboard.
        Calculates counts for appointments, records, and active medications.
        """
        # 1. Total & Upcoming Appointments
        total_appointments = db.query(Appointment).filter(Appointment.patient_id == user_id).count()
        upcoming_appointments = db.query(Appointment).filter(
            Appointment.patient_id == user_id,
            Appointment.status == "scheduled"
        ).count()

        # 2. Total Medical Records
        medical_records = db.query(MedicalRecord).filter(MedicalRecord.patient_id == user_id).count()

        # 3. Active Prescriptions
        active_prescriptions = db.query(Prescription).filter(
            Prescription.patient_id == user_id,
            Prescription.status == "Active"
        ).count()

        return {
            "total_appointments": total_appointments,
            "upcoming_appointments": upcoming_appointments,
            "medical_records": medical_records,
            "active_prescriptions": active_prescriptions,
            "recent_visits": [], # Placeholder for now, can be expanded to return recent record titles
        }
