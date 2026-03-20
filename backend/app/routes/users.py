from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.auth.dependencies import get_current_user, require_role

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/")
def get_users(db: Session = Depends(get_db), admin=Depends(require_role("admin"))):
    return db.query(User).all()


@router.patch("/{user_id}/status")
def update_status(user_id: str, payload: dict, db: Session = Depends(get_db), admin=Depends(require_role("admin"))):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if "status" in payload:
        user.status = payload["status"]
        db.commit()
    return {"user_id": user_id, "status": user.status}


@router.delete("/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db), admin=Depends(require_role("admin"))):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}
