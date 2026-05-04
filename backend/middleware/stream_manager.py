"""Stream management for SSE-based supervisor workflow execution.

Provides:
- Active stream tracking per user
- Cancellation tokens for interrupt/reprompt
- Automatic cleanup on completion/cancellation
"""
from __future__ import annotations

import asyncio
import logging
from collections import defaultdict
from datetime import datetime, timedelta
from threading import RLock
from typing import Optional

log = logging.getLogger(__name__)

# ── Active Stream Tracking ──────────────────────────────────────────────
_active_streams: dict[str, asyncio.Event] = {}
_stream_lock = RLock()


def create_stream_token(stream_key: str) -> asyncio.Event:
    """Create a new cancellation token for a stream key.

    Automatically cancels any existing stream for this key (reprompt handling).
    Returns an Event that will be set when stream should be cancelled.
    """
    with _stream_lock:
        # Cancel previous stream if exists (reprompt behavior)
        if stream_key in _active_streams:
            log.info(f"Cancelling previous stream for key {stream_key} (reprompt)")
            _active_streams[stream_key].set()
        
        # Create new cancellation token
        cancel_token = asyncio.Event()
        _active_streams[stream_key] = cancel_token
        log.info(f"Created new stream token for key {stream_key}")
        return cancel_token


def cancel_stream(stream_key: str) -> bool:
    """Cancel active stream for a key (interrupt behavior).

    Returns True if a stream was cancelled, False if no active stream.
    """
    with _stream_lock:
        if stream_key in _active_streams:
            log.info(f"Stream key {stream_key} cancelled stream")
            _active_streams[stream_key].set()
            return True
        return False


def remove_stream_token(stream_key: str):
    """Remove stream token after completion/cancellation."""
    with _stream_lock:
        if stream_key in _active_streams:
            del _active_streams[stream_key]
            log.info(f"Removed stream token for key {stream_key}")


def is_cancelled(stream_key: str) -> bool:
    """Check if stream for key has been cancelled."""
    with _stream_lock:
        token = _active_streams.get(stream_key)
        return token.is_set() if token else False


# ── Rate Limiting ───────────────────────────────────────────────────────
class RateLimiter:
    """Token bucket rate limiter to prevent API credit abuse.
    
    Config:
    - max_requests: Maximum requests in time window
    - window_seconds: Time window for rate limiting
    - burst_allowance: Additional requests allowed for burst traffic
    """
    
    def __init__(
        self,
        max_requests: int = 10,
        window_seconds: int = 60,
        burst_allowance: int = 5,
    ):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.burst_allowance = burst_allowance
        
        # Track request timestamps per user
        self._user_requests: dict[str, list[datetime]] = defaultdict(list)
        self._lock = RLock()
        
        log.info(
            f"RateLimiter initialized: {max_requests} req/{window_seconds}s "
            f"(burst: +{burst_allowance})"
        )
    
    def check_rate_limit(self, user_id: str) -> tuple[bool, Optional[str]]:
        """Check if user is within rate limit.
        
        Returns:
            (allowed, error_message) - allowed is True if within limit
        """
        with self._lock:
            now = datetime.now()
            window_start = now - timedelta(seconds=self.window_seconds)
            
            # Remove expired timestamps
            self._user_requests[user_id] = [
                ts for ts in self._user_requests[user_id]
                if ts > window_start
            ]
            
            current_count = len(self._user_requests[user_id])
            limit = self.max_requests + self.burst_allowance
            
            if current_count >= limit:
                remaining = self.window_seconds - (now - self._user_requests[user_id][0]).seconds
                return False, (
                    f"Rate limit exceeded: {current_count}/{limit} requests in "
                    f"{self.window_seconds}s window. Try again in {remaining}s."
                )
            
            # Record this request
            self._user_requests[user_id].append(now)
            return True, None
    
    def get_stats(self, user_id: str) -> dict:
        """Get current rate limit stats for a user."""
        with self._lock:
            now = datetime.now()
            window_start = now - timedelta(seconds=self.window_seconds)
            
            valid_requests = [
                ts for ts in self._user_requests.get(user_id, [])
                if ts > window_start
            ]
            
            return {
                "user_id": user_id,
                "requests_in_window": len(valid_requests),
                "limit": self.max_requests,
                "burst_allowance": self.burst_allowance,
                "window_seconds": self.window_seconds,
                "remaining": max(0, self.max_requests + self.burst_allowance - len(valid_requests)),
            }


# Global rate limiter instance
_rate_limiter = RateLimiter(
    max_requests=10,  # 10 requests per minute
    window_seconds=60,
    burst_allowance=5,  # Allow up to 15 in burst
)


def get_rate_limiter() -> RateLimiter:
    """Get the global rate limiter instance."""
    return _rate_limiter


__all__ = [
    "create_stream_token",
    "cancel_stream",
    "remove_stream_token",
    "is_cancelled",
    "RateLimiter",
    "get_rate_limiter",
]
