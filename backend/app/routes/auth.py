from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin
from app.auth.hashing import hash_password, verify_password
from app.auth.jwt_handler import create_token, create_refresh_token, decode_token
from app.rate_limit import rate_limit_request
from jose import JWTError
import uuid

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register")
def register(user: UserCreate, request: Request, db: Session = Depends(get_db)):
    rate_limit_request(request=request, key_prefix="auth_register", limit=5, window_seconds=60)
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        clerk_id=str(uuid.uuid4()),
        email=user.email,
        password_hash=hash_password(user.password),
        role=user.role
    )
    db.add(new_user)
    db.commit()
    return {"message": "User created successfully"}

@router.post("/login")
def login(user: UserLogin, request: Request, db: Session = Depends(get_db)):
    rate_limit_request(request=request, key_prefix="auth_login", limit=10, window_seconds=60)
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token_data = {
        "user_id": str(db_user.user_id),
        "role": db_user.role if isinstance(db_user.role, str) else db_user.role.value
    }
    return {
        "access_token": create_token(token_data),
        "refresh_token": create_refresh_token(token_data),
        "user": {
            "id": str(db_user.user_id),
            "email": db_user.email,
            "role": db_user.role
        }
    }

@router.post("/refresh")
def refresh(request: Request, db: Session = Depends(get_db)):
    rate_limit_request(request=request, key_prefix="auth_refresh", limit=20, window_seconds=60)
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing refresh token")

    token = auth_header.split(" ")[1]
    try:
        payload = decode_token(token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")

        user_id = payload.get("user_id")
        from uuid import UUID
        user = db.query(User).filter(User.user_id == UUID(str(user_id))).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        token_data = {
            "user_id": str(user.user_id),
            "role": user.role if isinstance(user.role, str) else user.role.value
        }
        return {"access_token": create_token(token_data)}

    except HTTPException:
        raise
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")