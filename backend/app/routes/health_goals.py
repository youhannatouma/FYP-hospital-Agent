from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Annotated, List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.auth.dependencies import get_current_user, require_role
from app.database import get_db
from app.models.user import User
from app.models.health_goal import HealthGoal
from app.skills.error_handling_skill import ErrorHandlingSkill

router = APIRouter(prefix="/health-goals", tags=["Health Goals"])

class HealthGoalCreate(BaseModel):
    title: str
    description: Optional[str] = None
    target_value: str
    current_value: Optional[str] = None
    progress_percentage: Optional[int] = 0
    category: Optional[str] = None
    target_date: Optional[datetime] = None

class HealthGoalUpdate(BaseModel):
    current_value: Optional[str] = None
    progress_percentage: Optional[int] = None
    status: Optional[str] = None

@router.post("", response_model=dict)
def create_goal(
    payload: HealthGoalCreate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_role("patient"))]
):
    try:
        goal = HealthGoal(
            patient_id=user.user_id,
            title=payload.title,
            description=payload.description,
            target_value=payload.target_value,
            current_value=payload.current_value,
            progress_percentage=payload.progress_percentage,
            category=payload.category,
            target_date=payload.target_date
        )
        db.add(goal)
        db.commit()
        db.refresh(goal)
        return {"goal_id": str(goal.goal_id), "status": "Created"}
    except Exception as e:
        db.rollback()
        raise ErrorHandlingSkill.handle(e)

@router.get("", response_model=List[dict])
def get_my_goals(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_role("patient"))]
):
    try:
        goals = db.query(HealthGoal).filter(
            HealthGoal.patient_id == user.user_id,
            HealthGoal.deleted_at == None
        ).order_by(HealthGoal.created_at.desc()).all()
        
        return [
            {
                "id": str(g.goal_id),
                "title": g.title,
                "description": g.description,
                "target_value": g.target_value,
                "current_value": g.current_value,
                "progress": g.progress_percentage,
                "category": g.category,
                "status": g.status,
                "created_at": g.created_at.isoformat() if g.created_at else None,
                "target_date": g.target_date.isoformat() if g.target_date else None
            } for g in goals
        ]
    except Exception as e:
        raise ErrorHandlingSkill.handle(e)

@router.patch("/{goal_id}")
def update_goal(
    goal_id: str,
    payload: HealthGoalUpdate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_role("patient"))]
):
    try:
        goal = db.query(HealthGoal).filter(
            HealthGoal.goal_id == UUID(goal_id),
            HealthGoal.patient_id == user.user_id
        ).first()
        
        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found")
            
        if payload.current_value is not None:
            goal.current_value = payload.current_value
        if payload.progress_percentage is not None:
            goal.progress_percentage = payload.progress_percentage
        if payload.status is not None:
            goal.status = payload.status
            
        db.commit()
        return {"status": "Updated"}
    except Exception as e:
        db.rollback()
        raise ErrorHandlingSkill.handle(e)

@router.delete("/{goal_id}")
def delete_goal(
    goal_id: str,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_role("patient"))]
):
    try:
        goal = db.query(HealthGoal).filter(
            HealthGoal.goal_id == UUID(goal_id),
            HealthGoal.patient_id == user.user_id
        ).first()
        
        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found")
            
        goal.deleted_at = datetime.now()
        db.commit()
        return {"status": "Deleted"}
    except Exception as e:
        db.rollback()
        raise ErrorHandlingSkill.handle(e)
