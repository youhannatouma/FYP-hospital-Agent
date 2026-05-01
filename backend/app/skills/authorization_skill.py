from typing import Any, Iterable
from uuid import UUID

from fastapi import HTTPException


class AuthorizationSkill:
    @staticmethod
    def authorize_role(user: Any, allowed_roles: Iterable[str]) -> None:
        role = str(getattr(user, "role", "") or "")
        if role not in {str(item) for item in allowed_roles}:
            raise HTTPException(status_code=403, detail="Not authorized")

    @staticmethod
    def authorize_ownership(user: Any, owner_id: UUID | str) -> None:
        user_id = str(getattr(user, "user_id", "") or "")
        if str(getattr(user, "role", "") or "") == "admin":
            return
        if user_id != str(owner_id):
            raise HTTPException(status_code=403, detail="Not authorized")

    @staticmethod
    def authorize_resource_access(user: Any, allowed_user_ids: Iterable[UUID | str]) -> None:
        if str(getattr(user, "role", "") or "") == "admin":
            return
        user_id = str(getattr(user, "user_id", "") or "")
        allowed = {str(item) for item in allowed_user_ids}
        if user_id not in allowed:
            raise HTTPException(status_code=403, detail="Not authorized")

    @staticmethod
    def assert_booking_actor(db: Any, actor_id: UUID, patient_id: UUID) -> dict:
        return {"actor_user_id": str(actor_id), "patient_user_id": str(patient_id), "authorized": True}
