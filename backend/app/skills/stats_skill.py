from sqlalchemy.orm import Session
from typing import Any


class StatsSkill:
    @staticmethod
    def get_patient_stats(db: Session, user_id: Any) -> dict:
        return {
            "total_appointments": 0,
            "upcoming_appointments": 0,
            "medications": 0,
            "recent_visits": [],
        }
