"""Middleware & Infrastructure Package.

This package contains cross-cutting infrastructure concerns:

- stream_manager.py: SSE stream lifecycle management + rate limiting
- approval_manager.py: Human-in-the-loop approval orchestration (Phase 3 final)
- lock_manager.py: Deadlock-prevention with ordered lock acquisition

These components provide essential infrastructure for secure, reliable operations.
"""

from .stream_manager import (
    StreamManager,
    RateLimiter,
    get_stream_manager,
    get_rate_limiter,
)

from .approval_manager import (
    ApprovalManager,
    ApprovalRequest,
    ApprovalPolicy,
    get_approval_manager,
)

from .lock_manager import (
    get_ordered_lock,
    acquire_ordered,
)

__all__ = [
    # Streaming
    "StreamManager",
    "RateLimiter",
    "get_stream_manager",
    "get_rate_limiter",
    # Approvals
    "ApprovalManager",
    "ApprovalRequest",
    "ApprovalPolicy",
    "get_approval_manager",
    # Locking
    "get_ordered_lock",
    "acquire_ordered",
]
