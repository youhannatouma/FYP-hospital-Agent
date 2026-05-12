"""
Rate limiting for API protection.

Supports both Redis-based distributed rate limiting (production)
and in-memory fallback (development/single-server).
"""

import time
import threading
import os
import logging
from collections import defaultdict, deque
from typing import Optional

from fastapi import HTTPException, Request

log = logging.getLogger("backend.rate_limit")

# In-memory sliding-window rate limiter for fallback.
_WINDOWS: dict[str, deque] = defaultdict(deque)
_LOCK = threading.Lock()

# Redis client (lazy initialized)
_redis_client: Optional[object] = None


def _get_redis_client():
    """
    Get or create Redis client for distributed rate limiting.
    
    Returns:
        Redis client or None if Redis is unavailable/disabled
    """
    global _redis_client
    
    if _redis_client is not None:
        return _redis_client
    
    # Check if Redis is enabled
    if not os.getenv("REDIS_ENABLED", "").lower() in {"true", "1", "yes"}:
        return None
    
    try:
        import redis
        
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        _redis_client = redis.from_url(redis_url, decode_responses=True)
        
        # Test connection
        _redis_client.ping()
        log.info("Redis rate limiter initialized")
        return _redis_client
    
    except ImportError:
        log.warning("Redis library not installed. Using in-memory rate limiter.")
        return None
    except Exception as e:
        log.warning(f"Failed to connect to Redis: {e}. Falling back to in-memory limiter.")
        return None


def _extract_client_ip(request: Request) -> str:
    """
    Extract client IP address from request, handling proxies.
    
    Args:
        request: FastAPI Request object
    
    Returns:
        Client IP address or 'unknown'
    """
    # Check X-Forwarded-For header (for proxies/load balancers)
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        # Take the first IP from the chain (original client)
        return forwarded.split(",")[0].strip()
    
    # Fallback to direct connection IP
    if request.client and request.client.host:
        return request.client.host
    
    return "unknown"


def _rate_limit_redis(
    key: str,
    limit: int,
    window_seconds: int,
) -> bool:
    """
    Rate limit using Redis.
    
    Args:
        key: Rate limit key (e.g., 'auth_login:192.168.1.1')
        limit: Maximum requests in window
        window_seconds: Time window in seconds
    
    Returns:
        True if request is allowed, False if limit exceeded
    """
    redis_client = _get_redis_client()
    if not redis_client:
        return True  # Fallback to allowing request
    
    try:
        current = redis_client.incr(key)
        
        # Set expiration on first request
        if current == 1:
            redis_client.expire(key, window_seconds)
        
        return current <= limit
    
    except Exception as e:
        log.error(f"Redis rate limit error: {e}. Allowing request.")
        return True  # Fail open - allow request on error


def _rate_limit_memory(
    key: str,
    limit: int,
    window_seconds: int,
) -> bool:
    """
    Rate limit using in-memory sliding window (single-process fallback).
    
    Args:
        key: Rate limit key
        limit: Maximum requests in window
        window_seconds: Time window in seconds
    
    Returns:
        True if request is allowed, False if limit exceeded
    """
    now = time.time()

    with _LOCK:
        q = _WINDOWS[key]

        # Drop timestamps outside the sliding window
        cutoff = now - window_seconds
        while q and q[0] <= cutoff:
            q.popleft()

        if len(q) >= limit:
            return False

        q.append(now)
        return True


def rate_limit_request(
    *,
    request: Request,
    key_prefix: str,
    limit: int,
    window_seconds: int,
) -> None:
    """
    Rate limit a request using Redis (distributed) or in-memory fallback.
    
    Args:
        request: FastAPI Request object
        key_prefix: Prefix for rate limit key (e.g., 'auth_login')
        limit: Maximum requests allowed in window
        window_seconds: Time window in seconds
    
    Raises:
        HTTPException: 429 Too Many Requests if limit exceeded
    
    Examples:
        # In a route handler:
        @router.post("/login")
        def login(user: UserLogin, request: Request, db: Session = Depends(get_db)):
            rate_limit_request(
                request=request,
                key_prefix="auth_login",
                limit=10,
                window_seconds=60
            )
            # ... rest of login logic
    
    Note:
        For production with multiple servers:
        - Set REDIS_ENABLED=true and REDIS_URL=redis://... in environment
        - Automatically falls back to in-memory if Redis unavailable
    """
    client_ip = _extract_client_ip(request)
    key = f"{key_prefix}:{client_ip}"
    
    # Try Redis first, fall back to in-memory
    redis_client = _get_redis_client()
    allowed = _rate_limit_redis(key, limit, window_seconds) if redis_client else _rate_limit_memory(key, limit, window_seconds)
    
    if not allowed:
        log.warning(f"Rate limit exceeded: {key}")
        raise HTTPException(
            status_code=429,
            detail="Too many requests, please try again later.",
        )


# Production-ready rate limit configuration
RATE_LIMITS = {
    "auth_register": {"limit": 5, "window_seconds": 60},      # 5 per minute
    "auth_login": {"limit": 10, "window_seconds": 60},        # 10 per minute
    "auth_refresh": {"limit": 20, "window_seconds": 60},      # 20 per minute
    "api_general": {"limit": 100, "window_seconds": 60},      # 100 per minute
    "file_upload": {"limit": 10, "window_seconds": 3600},     # 10 per hour
}


