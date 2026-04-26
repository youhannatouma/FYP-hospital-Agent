from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MessageCreate(BaseModel):
    receiver_id: str
    subject: Optional[str] = None
    body: str

class MessageResponse(BaseModel):
    message_id: str
    sender_id: str
    receiver_id: str
    subject: Optional[str] = None
    body: str
    is_read: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
