from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Annotated

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.skills.notification_skill import NotificationSkill

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("")
def get_notifications(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)]
):
    notifications = NotificationSkill.get_unread(db, user.user_id)
    return [
        {
            "id": str(n.notification_id),
            "type": n.type,
            "title": n.title,
            "message": n.message,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat() if n.created_at else None
        } for n in notifications
    ]

@router.patch("/{notification_id}/read")
def mark_read(
    notification_id: str,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)]
):
    success = NotificationSkill.mark_read(db, UUID(notification_id))
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"success": True}

@router.patch("/read-all")
def mark_all_read(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)]
):
    NotificationSkill.mark_all_read(db, user.user_id)
    return {"success": True}
