import time
import threading
from collections import defaultdict, deque

from fastapi import HTTPException, Request

# In-memory sliding-window rate limiter.
# Note: For production you should use Redis/shared storage.
_WINDOWS: dict[str, deque] = defaultdict(deque)
_LOCK = threading.Lock()


def rate_limit_request(
    *,
    request: Request,
    key_prefix: str,
    limit: int,
    window_seconds: int,
) -> None:
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

