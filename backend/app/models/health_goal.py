from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base
import uuid

class HealthGoal(Base):
    __tablename__ = "health_goals"

    goal_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("usr.user_id"), nullable=False)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    target_value = Column(String(100), nullable=False)
    current_value = Column(String(100), nullable=True)
    progress_percentage = Column(Integer, default=0)
    
    category = Column(String(50), nullable=True) # e.g., 'Weight', 'Cardio', 'Lipids'
    status = Column(String(50), default="In Progress") # In Progress, Completed, On Track
    
    start_date = Column(DateTime(timezone=True), server_default=func.now())
    target_date = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)
