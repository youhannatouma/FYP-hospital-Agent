import time
import threading
from collections import defaultdict, deque

from fastapi import HTTPException, Request

# In-memory sliding-window rate limiter.
# NOTE: For production with multiple servers, use Redis instead.
# This implementation is single-process and non-persistent.
_WINDOWS: dict[str, deque] = defaultdict(deque)
_LOCK = threading.Lock()


def rate_limit_request(
    *,
    request: Request,
    key_prefix: str,
    limit: int,
    window_seconds: int,
) -> None:
    """
    Rate limit a request using sliding window algorithm.
    
    Args:
        request: FastAPI Request object
        key_prefix: Prefix for rate limit key (e.g., 'auth_login')
        limit: Maximum requests allowed in window
        window_seconds: Time window in seconds
    
    Raises:
        HTTPException: 429 Too Many Requests if limit exceeded
    
    Note:
        For production deployments with multiple servers:
        - Replace with Redis-based rate limiter
        - Example: redis.incr(key) with expire time
        - This ensures distributed rate limiting
    """
    ip = "unknown"
    if request.client and request.client.host:
        ip = request.client.host

    key = f"{key_prefix}:{ip}"
    now = time.time()

    with _LOCK:
        q = _WINDOWS[key]

        # Drop timestamps outside the sliding window.
        cutoff = now - window_seconds
        while q and q[0] <= cutoff:
            q.popleft()

        if len(q) >= limit:
            raise HTTPException(
                status_code=429,
                detail="Too many requests, please try again later.",
            )

        q.append(now)


# Production-ready rate limit configuration
RATE_LIMITS = {
    "auth_register": {"limit": 5, "window_seconds": 60},      # 5 per minute
    "auth_login": {"limit": 10, "window_seconds": 60},        # 10 per minute
    "auth_refresh": {"limit": 20, "window_seconds": 60},      # 20 per minute
    "api_general": {"limit": 100, "window_seconds": 60},      # 100 per minute
    "file_upload": {"limit": 10, "window_seconds": 3600},     # 10 per hour
}


