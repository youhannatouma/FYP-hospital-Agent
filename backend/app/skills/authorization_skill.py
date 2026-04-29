from typing import Any
from uuid import UUID


class AuthorizationSkill:
    @staticmethod
    def assert_booking_actor(db: Any, actor_id: UUID, patient_id: UUID) -> dict:
        return {"actor_user_id": str(actor_id), "patient_user_id": str(patient_id), "authorized": True}
