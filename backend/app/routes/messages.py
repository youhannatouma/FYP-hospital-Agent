from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Annotated, List
from uuid import UUID

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.message import InboxMessageResponse, MessageCreate, MessageResponse
from app.skills.message_skill import MessageSkill
from app.skills.error_handling_skill import ErrorHandlingSkill

router = APIRouter(prefix="/messages", tags=["Messages"])

@router.post("", response_model=MessageResponse)
def send_message(
    payload: MessageCreate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)]
):
    try:
        msg = MessageSkill.create_message(
            db=db,
            sender_id=user.user_id,
            receiver_id=UUID(payload.receiver_id),
            body=payload.body,
            subject=payload.subject
        )
        
        return {
            "message_id": str(msg.message_id),
            "sender_id": str(msg.sender_id),
            "receiver_id": str(msg.receiver_id),
            "subject": msg.subject,
            "body": msg.body,
            "is_read": msg.is_read,
            "created_at": msg.created_at
        }
    except Exception as e:
        raise ErrorHandlingSkill.handle(e)

@router.get("/my", response_model=List[InboxMessageResponse])
def get_my_messages(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)]
):
    try:
        messages = MessageSkill.get_messages_for_user(db, user.user_id)
        
        result = []
        for msg in messages:
            sender = db.query(User).filter(User.user_id == msg.sender_id).first()
            receiver = db.query(User).filter(User.user_id == msg.receiver_id).first()
            
            result.append({
                "message_id": str(msg.message_id),
                "sender_id": str(msg.sender_id),
                "sender_name": f"{sender.first_name or ''} {sender.last_name or ''}".strip() if sender else "Unknown",
                "receiver_id": str(msg.receiver_id),
                "receiver_name": f"{receiver.first_name or ''} {receiver.last_name or ''}".strip() if receiver else "Unknown",
                "subject": msg.subject,
                "body": msg.body,
                "is_read": msg.is_read,
                "created_at": msg.created_at.isoformat() if msg.created_at else None
            })
            
        return result
    except Exception as e:
        raise ErrorHandlingSkill.handle(e)

@router.patch("/{message_id}/read")
def mark_message_read(
    message_id: str,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)]
):
    try:
        success = MessageSkill.mark_as_read(db, UUID(message_id), user.user_id)
        if not success:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Message not found")
        return {"success": True}
    except Exception as e:
        raise ErrorHandlingSkill.handle(e)
