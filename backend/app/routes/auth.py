from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import uuid
import asyncio
from uuid import UUID
from jose import JWTError

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin
from app.auth.hashing import hash_password, verify_password
from app.auth.jwt_handler import create_token, create_refresh_token, decode_token
from app.rate_limit import rate_limit_request
from app.password_policy import PasswordPolicy
from app.audit import AuditLogger
from app.models.audit_log import AuditEventType

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register")
def register(user: UserCreate, request: Request, db: Session = Depends(get_db)):
    """
    Register a new user with password policy enforcement.
    
    Validates password strength, checks for existing email,
    hashes password securely, and logs the event.
    """
    # Rate limit registration attempts
    rate_limit_request(request=request, key_prefix="auth_register", limit=5, window_seconds=60)
    
    # Validate password policy
    is_valid, error_msg = PasswordPolicy.validate(user.password)
    if not is_valid:
        # Log failed registration (weak password)
        asyncio.create_task(
            AuditLogger.log_event(
                db=db,
                event_type=AuditEventType.ERROR,
                user_email=user.email,
                status="failure",
                details={"reason": f"Registration failed: {error_msg}"},
                request=request,
            )
        )
        raise HTTPException(status_code=400, detail=error_msg)
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        # Log duplicate registration attempt
        asyncio.create_task(
            AuditLogger.log_event(
                db=db,
                event_type=AuditEventType.ERROR,
                user_email=user.email,
                status="failure",
                details={"reason": "Email already registered"},
                request=request,
            )
        )
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    new_user = User(
        clerk_id=str(uuid.uuid4()),
        email=user.email,
        password_hash=hash_password(user.password),
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Log successful registration
    asyncio.create_task(
        AuditLogger.log_event(
            db=db,
            event_type=AuditEventType.ADMIN_ACTION,
            user_email=user.email,
            resource_id=str(new_user.user_id),
            resource_type="user",
            status="success",
            details={"action": "User registration", "role": user.role},
            request=request,
        )
    )
    
    return {
        "message": "User created successfully",
        "user_id": str(new_user.user_id),
        "password_strength": PasswordPolicy.get_strength_description(user.password)
    }


@router.post("/login")
def login(user: UserLogin, request: Request, db: Session = Depends(get_db)):
    """
    Login with audit logging for security tracking.
    
    Tracks successful and failed login attempts, enforces rate limiting,
    and logs authentication events for compliance.
    """
    # Rate limit login attempts
    rate_limit_request(request=request, key_prefix="auth_login", limit=10, window_seconds=60)
    
    # Lookup user
    db_user = db.query(User).filter(User.email == user.email).first()
    
    # Validate credentials
    if not db_user or not verify_password(user.password, db_user.password_hash):
        # Log failed login attempt
        asyncio.create_task(
            AuditLogger.log_login(
                db=db,
                user_email=user.email,
                success=False,
                request=request,
                details={"reason": "Invalid credentials"},
            )
        )
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Generate tokens
    token_data = {
        "user_id": str(db_user.user_id),
        "role": db_user.role if isinstance(db_user.role, str) else db_user.role.value
    }
    
    # Log successful login
    asyncio.create_task(
        AuditLogger.log_login(
            db=db,
            user_email=user.email,
            success=True,
            request=request,
        )
    )
    
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
    """
    Refresh access token with audit logging.
    """
    # Rate limit token refresh
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
        user = db.query(User).filter(User.user_id == UUID(str(user_id))).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        token_data = {
            "user_id": str(user.user_id),
            "role": user.role if isinstance(user.role, str) else user.role.value
        }
        
        # Log token refresh
        asyncio.create_task(
            AuditLogger.log_event(
                db=db,
                event_type=AuditEventType.ADMIN_ACTION,
                user_id=str(user.user_id),
                user_email=user.email,
                user_role=token_data["role"],
                status="success",
                details={"action": "Token refreshed"},
                request=request,
            )
        )
        
        return {"access_token": create_token(token_data)}

    except HTTPException:
        raise
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")