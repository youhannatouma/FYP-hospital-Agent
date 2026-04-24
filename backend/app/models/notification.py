from sqlalchemy import Column, Text, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.database import Base

class Notification(Base):
    __tablename__ = "notification"

    notification_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    
    type = Column(Text) # 'Appointment', 'Record', 'System', 'Chat'
    title = Column(Text, nullable=False)
    message = Column(Text, nullable=False)
    
    is_read = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=func.now())
    deleted_at = Column(DateTime)
