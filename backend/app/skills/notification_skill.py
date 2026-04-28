from __future__ import annotations

from uuid import UUID

from sqlalchemy.orm import Session

from app.models.notification import Notification


class NotificationSkill:
    @staticmethod
    def get_unread(db: Session, user_id: UUID) -> list[Notification]:
        return (
            db.query(Notification)
            .filter(
                Notification.user_id == user_id,
                Notification.is_read.is_(False),
                Notification.deleted_at.is_(None),
            )
            .order_by(Notification.created_at.desc())
            .all()
        )

    @staticmethod
    def mark_read(db: Session, notification_id: UUID) -> bool:
        notification = (
            db.query(Notification)
            .filter(Notification.notification_id == notification_id, Notification.deleted_at.is_(None))
            .first()
        )
        if not notification:
            return False
        notification.is_read = True
        db.commit()
        return True

    @staticmethod
    def mark_all_read(db: Session, user_id: UUID) -> int:
        updated = (
            db.query(Notification)
            .filter(
                Notification.user_id == user_id,
                Notification.is_read.is_(False),
                Notification.deleted_at.is_(None),
            )
            .update({"is_read": True})
        )
        db.commit()
        return int(updated or 0)
