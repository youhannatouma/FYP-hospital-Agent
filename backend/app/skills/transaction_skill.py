from typing import Any
from uuid import UUID


class TransactionSkill:
    @staticmethod
    def create_appointment_transaction(db: Any, slot_id: UUID, patient_id: UUID, doctor_id: UUID, reason: str = "") -> Any:
        return None
