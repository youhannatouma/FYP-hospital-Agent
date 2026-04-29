from __future__ import annotations

from sqlalchemy.orm import Session


class ClerkSyncSkill:
    @staticmethod
    def sync_all_users(db: Session, clerk_client) -> int:
        # Placeholder implementation to keep admin sync endpoint import-safe.
        # Real sync logic can be expanded when Clerk user ingestion is needed.
        _ = db
        _ = clerk_client
        return 0
