import os
from urllib.parse import urlparse

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from clerk_backend_api import Clerk
from sqlalchemy.orm import Session
from jose import jwt as jose_jwt, JWTError
from uuid import UUID
import httpx
from cachetools import TTLCache

from app.database import get_db
from app.models.user import User
from app.config import SECRET_KEY, ALGORITHM

security = HTTPBearer()

_CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
clerk = Clerk(bearer_auth=_CLERK_SECRET_KEY) if _CLERK_SECRET_KEY else None

# Cache for JWKS (1-hour TTL)
_jwks_cache: TTLCache = TTLCache(maxsize=8, ttl=3600)


def _extract_primary_email(clerk_user) -> str | None:
    try:
        email_addresses = getattr(clerk_user, "email_addresses", None) or []
        if email_addresses:
            primary = email_addresses[0]
            value = getattr(primary, "email_address", None)
            return str(value).strip() if value else None
    except Exception:
        return None
    return None


def _extract_claimed_role(clerk_user) -> str | None:
    try:
        metadata = getattr(clerk_user, "public_metadata", None) or {}
        if isinstance(metadata, dict):
            role = str(metadata.get("role") or "").strip().lower()
            if role in {"doctor", "patient", "admin"}:
                return role
    except Exception:
        return None
    return None


def _should_sync_role(current_role: str | None, claimed_role: str | None) -> bool:
    """Prevent accidental privilege downgrades from stale Clerk metadata.

    Allowed:
    - setting role when empty
    - same role (no-op)
    - upgrades patient -> doctor/admin
    - explicit doctor/admin switch when both privileged (admin <-> doctor)

    Blocked:
    - doctor/admin -> patient downgrade via metadata drift
    """
    current = str(current_role or "").strip().lower()
    claimed = str(claimed_role or "").strip().lower()
    if not claimed:
        return False
    if not current:
        return True
    if current == claimed:
        return False
    if current in {"doctor", "admin"} and claimed == "patient":
        return False
    return True


def _normalize_issuer_url(issuer: str | None) -> str | None:
    if not issuer:
        return None
    parsed = urlparse(issuer)
    if parsed.scheme and parsed.netloc:
        return f"{parsed.scheme}://{parsed.netloc}"
    return None


def _get_clerk_jwks(issuer: str | None = None):
    """Fetch and cache Clerk's public JWKS."""
    issuer_base = _normalize_issuer_url(issuer)
    cache_key = issuer_base or "default"
    if cache_key in _jwks_cache:
        return _jwks_cache[cache_key]

    # Build JWKS URL from environment first, then issuer, then fallback.
    jwks_url = os.getenv("CLERK_JWKS_URL")
    if not jwks_url:
        if issuer_base:
            jwks_url = f"{issuer_base}/.well-known/jwks.json"
        else:
            jwks_url = "https://api.clerk.com/.well-known/jwks.json"

    try:
        response = httpx.get(jwks_url, timeout=10)
        response.raise_for_status()
        jwks = response.json()
        _jwks_cache[cache_key] = jwks
        return jwks
    except Exception as e:
        print(f"[JWKS] Error fetching JWKS from {jwks_url}: {e}")
        # Return empty dict if fetching fails - will cause verification to fail gracefully
        return {"keys": []}


def _verify_clerk_token(token: str) -> dict:
    """Verify a Clerk JWT against their public JWKS."""
    try:
        unverified = jose_jwt.get_unverified_header(token)
        kid = unverified.get("kid")
        if not kid:
            raise ValueError("Missing 'kid' in token header")

        issuer = None
        try:
            claims = jose_jwt.get_unverified_claims(token)
            issuer = claims.get("iss")
        except Exception:
            issuer = None

        jwks = _get_clerk_jwks(issuer=issuer)
        keys = jwks.get("keys", []) if isinstance(jwks, dict) else []
        signing_key = next((key for key in keys if key.get("kid") == kid), None)
        if not signing_key:
            raise ValueError(f"No matching JWKS key for kid={kid}")

        payload = jose_jwt.decode(
            token,
            signing_key,
            algorithms=["RS256"],
            options={"verify_aud": False},
        )
        return payload
    except JWTError as e:
        print(f"[JWT] Token verification failed: {e}")
        raise ValueError(f"Invalid Clerk JWT: {e}")
    except Exception as e:
        print(f"[JWT] Unexpected error during verification: {e}")
        raise ValueError(f"Token verification error: {e}")


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    token = credentials.credentials

    # 1) Try Clerk JWT verification first (secure)
    try:
        payload = _verify_clerk_token(token)
        clerk_id = payload.get("sub")
        email = payload.get("email")
        metadata = payload.get("public_metadata", {})
        claimed_role = None
        if isinstance(metadata, dict):
            maybe_role = str(metadata.get("role") or "").strip().lower()
            if maybe_role in {"doctor", "patient", "admin"}:
                claimed_role = maybe_role

        clerk_user = None
        if clerk and clerk_id and (not email or not claimed_role):
            try:
                clerk_user = clerk.users.get(user_id=clerk_id)
                if not email:
                    email = _extract_primary_email(clerk_user)
                if not claimed_role:
                    claimed_role = _extract_claimed_role(clerk_user)
            except Exception as e:
                print(f"[AUTH] Could not hydrate Clerk profile for {clerk_id}: {e}")
        
        if clerk_id:
            # Match by clerk_id (already linked)
            user = db.query(User).filter(User.clerk_id == clerk_id).first()
            if user:
                # Keep DB role aligned with Clerk role metadata when available.
                if _should_sync_role(str(user.role), claimed_role):
                    user.role = claimed_role
                    db.commit()
                    db.refresh(user)
                return user
            
            # Match by email (seeded users or manual entries)
            if email:
                user = db.query(User).filter(User.email == email).first()
                if user:
                    # Link this Clerk account to the existing DB user
                    user.clerk_id = clerk_id
                    if _should_sync_role(str(user.role), claimed_role):
                        user.role = claimed_role
                    db.commit()
                    db.refresh(user)
                    return user
            
            # Auto-register: create a new user with full Clerk profile data
            role = "patient"
            first_name = ""
            last_name = ""
            phone_number = None
            
            # Extract role from Clerk metadata if available
            if claimed_role:
                role = claimed_role
            
            # Fetch full user profile from Clerk API to get name and phone
            if clerk_user is not None:
                try:
                    first_name = clerk_user.first_name or ""
                    last_name = clerk_user.last_name or ""
                    if hasattr(clerk_user, 'phone_numbers') and clerk_user.phone_numbers:
                        phone_number = clerk_user.phone_numbers[0].phone_number if hasattr(clerk_user.phone_numbers[0], 'phone_number') else None
                    if not email:
                        email = _extract_primary_email(clerk_user) or email
                except Exception as e:
                    print(f"[AUTO-REGISTER] Could not read hydrated Clerk profile for {clerk_id}: {e}")
            elif clerk:
                try:
                    clerk_user = clerk.users.get(user_id=clerk_id)
                    first_name = clerk_user.first_name or ""
                    last_name = clerk_user.last_name or ""
                    # Get first phone number if available
                    if hasattr(clerk_user, 'phone_numbers') and clerk_user.phone_numbers:
                        phone_number = clerk_user.phone_numbers[0].phone_number if hasattr(clerk_user.phone_numbers[0], 'phone_number') else None
                    if not email:
                        email = _extract_primary_email(clerk_user) or email
                    if not claimed_role:
                        claimed_role = _extract_claimed_role(clerk_user) or claimed_role
                except Exception as e:
                    print(f"[AUTO-REGISTER] Could not fetch Clerk profile for {clerk_id}: {e}")
            
            # Create new user with complete data
            new_user = User(
                clerk_id=clerk_id,
                email=email or f"user_{clerk_id}@hospital.com",
                first_name=first_name,
                last_name=last_name,
                phone_number=phone_number,
                role=role,
                status="Active"
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            print(f"[AUTO-REGISTER] Created new user: {new_user.email} with role={role}")
            return new_user
            
    except ValueError as e:
        # JWT verification failed, try fallback
        print(f"[AUTH] Clerk JWT verification failed: {e}")
        pass
    except Exception as e:
        # Unexpected error during Clerk JWT processing
        print(f"[AUTH] Unexpected error during Clerk JWT processing: {e}")
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


def require_role(required_roles: str | list[str]):
    def role_checker(user: User = Depends(get_current_user)):
        # If a single role is passed, convert to list for consistent checking
        roles_list = [required_roles] if isinstance(required_roles, str) else required_roles
        
        # user.role is stored as a plain string (e.g. "doctor", "patient", "admin")
        if str(user.role) not in roles_list:
            raise HTTPException(status_code=403, detail="Not authorized")
        return user

    return role_checker
