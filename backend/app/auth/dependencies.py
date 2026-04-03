import os

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from clerk_backend_api import Clerk
from sqlalchemy.orm import Session
from jose import jwt as jose_jwt
from uuid import UUID

from app.database import get_db
from app.models.user import User
from app.config import SECRET_KEY, ALGORITHM

security = HTTPBearer()

_CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
clerk = Clerk(bearer_auth=_CLERK_SECRET_KEY) if _CLERK_SECRET_KEY else None


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    token = credentials.credentials

    # 1) Preferred: Clerk session verification (if configured)
    if clerk is not None:
        try:
            session = clerk.sessions.verify_session(token)
            clerk_user_id = session.user_id
            user = db.query(User).filter(User.clerk_id == clerk_user_id).first()
            if user:
                return user

            # If clerk_id isn't provisioned correctly in our DB, fall back to
            # mapping the session by email (email is unique in our schema).
            email_candidates = []
            for attr in ("user_email_addresses", "email_addresses", "user_email_address", "user_email"):
                val = getattr(session, attr, None)
                if isinstance(val, str):
                    email_candidates.append(val)
                elif isinstance(val, (list, tuple, set)):
                    email_candidates.extend([x for x in val if isinstance(x, str)])

            # Also attempt a nested user object if the SDK returns one.
            sess_user = getattr(session, "user", None)
            if sess_user is not None:
                for attr in ("email_addresses", "email_address", "email"):
                    val = getattr(sess_user, attr, None)
                    if isinstance(val, str):
                        email_candidates.append(val)
                    elif isinstance(val, (list, tuple, set)):
                        email_candidates.extend([x for x in val if isinstance(x, str)])

            email_candidates = [e for e in email_candidates if e and "@" in e]
            if email_candidates:
                user = db.query(User).filter(User.email == email_candidates[0]).first()
                if user:
                    return user
        except Exception:
            # Fall through to JWT validation below.
            pass

    # 2) Fallback: verify our own HS256 JWT (if callers are using /auth/login)
    try:
        payload = jose_jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user_id = payload.get("user_id")
        if not user_id:
            raise ValueError("Missing user_id in JWT")

        user = db.query(User).filter(User.user_id == UUID(str(user_id))).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return user
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


def require_role(role: str):
    def role_checker(user: User = Depends(get_current_user)):
        # user.role is stored as a plain string (e.g. "doctor", "patient", "admin")
        if str(user.role) != role:
            raise HTTPException(status_code=403, detail="Not authorized")
        return user

    return role_checker