from __future__ import annotations

from typing import Iterable

from clerk_backend_api.models.getuserlistop import GetUserListRequest
from sqlalchemy.orm import Session

from app.models.user import User


class ClerkSyncSkill:
    @staticmethod
    def _extract_email(clerk_user) -> str | None:
        email_addresses = getattr(clerk_user, "email_addresses", None) or []
        if not email_addresses:
            return None
        primary = email_addresses[0]
        value = getattr(primary, "email_address", None)
        return str(value).strip() if value else None

    @staticmethod
    def _extract_role(clerk_user) -> str | None:
        metadata = getattr(clerk_user, "public_metadata", None) or {}
        if not isinstance(metadata, dict):
            return None
        role = str(metadata.get("role") or "").strip().lower()
        return role if role in {"doctor", "patient", "admin"} else None

    @staticmethod
    def sync_all_users(db: Session, clerk_client, roles: Iterable[str] | None = None) -> int:
        if clerk_client is None:
            return 0

        role_filter = {str(role).strip().lower() for role in (roles or []) if str(role).strip()}
        synced = 0
        offset = 0
        limit = 100

        while True:
            request = GetUserListRequest(limit=limit, offset=offset, order_by="-created_at")
            users = clerk_client.users.list(request=request)
            if not users:
                break

            for clerk_user in users:
                clerk_id = str(getattr(clerk_user, "id", "") or "").strip()
                email = ClerkSyncSkill._extract_email(clerk_user)
                role = ClerkSyncSkill._extract_role(clerk_user)

                if not clerk_id or not email or not role:
                    continue
                if role_filter and role not in role_filter:
                    continue

                existing = db.query(User).filter(User.clerk_id == clerk_id).first()
                if existing is None:
                    existing = db.query(User).filter(User.email == email).first()

                if existing is None:
                    existing = User(
                        clerk_id=clerk_id,
                        email=email,
                        first_name=getattr(clerk_user, "first_name", None) or "",
                        last_name=getattr(clerk_user, "last_name", None) or "",
                        role=role,
                        specialty=None,
                        status="Active",
                    )
                    db.add(existing)
                    synced += 1
                    continue

                changed = False
                if not existing.clerk_id:
                    existing.clerk_id = clerk_id
                    changed = True
                if not existing.first_name and getattr(clerk_user, "first_name", None):
                    existing.first_name = clerk_user.first_name
                    changed = True
                if not existing.last_name and getattr(clerk_user, "last_name", None):
                    existing.last_name = clerk_user.last_name
                    changed = True
                if not existing.status:
                    existing.status = "Active"
                    changed = True
                if existing.role != role and existing.role not in {"doctor", "admin"}:
                    existing.role = role
                    changed = True

                if changed:
                    synced += 1

            db.commit()
            if len(users) < limit:
                break
            offset += limit

        return synced
