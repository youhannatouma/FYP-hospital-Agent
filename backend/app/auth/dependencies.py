from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from clerk_backend_api import Clerk
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User

security = HTTPBearer()

CLERK_SECRET_KEY = "YOUR_CLERK_SECRET"
clerk = Clerk(bearer_auth=CLERK_SECRET_KEY)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    try:
        session = clerk.sessions.verify_session(token)
        clerk_user_id = session.user_id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Clerk token")

    user = db.query(User).filter(User.clerk_id == clerk_user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


def require_role(role: str):
    def role_checker(user: User = Depends(get_current_user)):
        if user.role.value != role:
            raise HTTPException(status_code=403, detail="Not authorized")
        return user
    return role_checker