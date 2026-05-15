from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional
from app.models.message import Message
from app.models.user import User
from app.skills.validation_skill import ValidationSkill

class MessageSkill:
    @staticmethod
    def create_message(
        db: Session,
        sender_id: UUID,
        receiver_id: UUID,
        body: str,
        subject: Optional[str] = None
    ) -> Message:
        from app.skills.transaction_skill import TransactionSkill
        
        with TransactionSkill.run_transaction(db):
            # Validate receiver exists
            receiver = db.query(User).filter(User.user_id == receiver_id).first()
            ValidationSkill.ensure_exists(receiver, "Receiver")

            msg = Message(
                sender_id=sender_id,
                receiver_id=receiver_id,
                subject=subject,
                body=body
            )
            db.add(msg)
            # No need for manual commit/refresh, handled by TransactionSkill
            return msg

    @staticmethod
    def get_messages_for_user(db: Session, user_id: UUID) -> List[Message]:
        return db.query(Message).filter(
            (Message.receiver_id == user_id) | (Message.sender_id == user_id),
            Message.deleted_at == None
        ).order_by(Message.created_at.desc()).all()

    @staticmethod
    def mark_as_read(db: Session, message_id: UUID, receiver_id: UUID) -> bool:
        msg = db.query(Message).filter(
            Message.message_id == message_id,
            Message.receiver_id == receiver_id
        ).first()
        if not msg:
            return False
        
        msg.is_read = True
        db.commit()
        return True
