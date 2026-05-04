"""Human-in-the-loop (HITL) approval system for workflow escalation.

Provides:
- Approval policy configuration (which operations need human approval)
- Workflow interruption at approval points
- Pending approval state management
- Human approval/rejection handling
- Automatic resume after approval
"""
from __future__ import annotations

import logging
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from threading import RLock
from typing import Any, Callable, Optional

log = logging.getLogger(__name__)


class ApprovalStatus(Enum):
    """Status of an approval request."""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXPIRED = "expired"


class ApprovalPolicy(Enum):
    """Approval policies for different operations."""
    ALWAYS = "always"  # Always require approval
    NEVER = "never"  # Never require approval
    THRESHOLD = "threshold"  # Require approval based on threshold
    RISKY = "risky"  # Require approval for risky operations


@dataclass
class ApprovalRequest:
    """Represents a pending human approval request."""
    approval_id: str
    user_id: str
    task_id: str
    tool_name: str
    operation_type: str  # e.g., "write", "delete", "bulk_operation"
    context: dict[str, Any]
    created_at: datetime
    expires_at: datetime
    status: ApprovalStatus = ApprovalStatus.PENDING
    human_response: Optional[str] = None
    human_user_id: Optional[str] = None
    responded_at: Optional[datetime] = None


# ── Approval Policy Configuration ──────────────────────────────────
_approval_policies: dict[str, ApprovalPolicy] = {
    # Memory operations
    "add_facts": ApprovalPolicy.NEVER,  # Safe, no approval needed
    "recall_memory": ApprovalPolicy.NEVER,  # Read-only, safe
    "memory_context": ApprovalPolicy.NEVER,  # Read-only, safe
    "user_fact_count": ApprovalPolicy.NEVER,  # Read-only, safe
    "clear_user": ApprovalPolicy.ALWAYS,  # Destructive, need approval
    
    # Medication operations (placeholder for future)
    "search_medication": ApprovalPolicy.NEVER,  # Read-only
    "check_drug_safety": ApprovalPolicy.RISKY,  # Critical safety check
    "recommend_medication": ApprovalPolicy.ALWAYS,  # Medical decision

    # Appointment operations
    "book_appointment_cross_patient": ApprovalPolicy.RISKY,
}

# Risky operation patterns that trigger approval
_risky_patterns = {
    "delete", "clear", "remove", "drop", "truncate",
    "medication", "prescription", "dosage", "drug", "cross_patient", "appointment"
}


def _check_approval_needed(tool_name: str, context: dict[str, Any]) -> bool:
    """Check if operation requires human approval based on policy."""
    policy = _approval_policies.get(tool_name, ApprovalPolicy.NEVER)
    
    if policy == ApprovalPolicy.ALWAYS:
        return True
    
    if policy == ApprovalPolicy.NEVER:
        return False
    
    if policy == ApprovalPolicy.RISKY:
        # Check if operation matches risky patterns
        tool_lower = tool_name.lower()
        return any(pattern in tool_lower for pattern in _risky_patterns)
    
    if policy == ApprovalPolicy.THRESHOLD:
        # Check context for threshold violations
        # Example: bulk operations exceeding limit
        if "count" in context and context["count"] > 100:
            return True
    
    return False


# ── Pending Approvals Storage ──────────────────────────────────────
_pending_approvals: dict[str, ApprovalRequest] = {}
_approval_lock = RLock()


def create_approval_request(
    user_id: str,
    task_id: str,
    tool_name: str,
    operation_type: str,
    context: dict[str, Any],
    ttl_seconds: int = 300,  # 5 minutes default
) -> ApprovalRequest:
    """Create a new approval request and store it as pending.
    
    Args:
        user_id: User requesting the operation
        task_id: Task ID from workflow
        tool_name: Name of the tool/operation
        operation_type: Type of operation (write, delete, etc.)
        context: Additional context for human reviewer
        ttl_seconds: Time to live before expiring
    
    Returns:
        ApprovalRequest object
    """
    approval_id = str(uuid.uuid4())
    now = datetime.now()
    
    request = ApprovalRequest(
        approval_id=approval_id,
        user_id=user_id,
        task_id=task_id,
        tool_name=tool_name,
        operation_type=operation_type,
        context=context,
        created_at=now,
        expires_at=now + timedelta(seconds=ttl_seconds),
    )
    
    with _approval_lock:
        _pending_approvals[approval_id] = request
    
    log.info(f"Created approval request {approval_id} for {user_id}/{task_id}")
    return request


def get_approval_request(approval_id: str) -> Optional[ApprovalRequest]:
    """Get an approval request by ID."""
    with _approval_lock:
        request = _pending_approvals.get(approval_id)
        if request and request.status == ApprovalStatus.PENDING and request.expires_at < datetime.now():
            request.status = ApprovalStatus.EXPIRED
            log.info(f"Approval {approval_id} expired")
        return request


def list_pending_approvals(user_id: Optional[str] = None) -> list[ApprovalRequest]:
    """List all pending approvals, optionally filtered by user."""
    with _approval_lock:
        approvals = list(_pending_approvals.values())
        
        if user_id:
            approvals = [a for a in approvals if a.user_id == user_id]
        
        # Filter out expired
        now = datetime.now()
        pending = []
        for approval in approvals:
            if approval.status == ApprovalStatus.PENDING:
                if approval.expires_at < now:
                    approval.status = ApprovalStatus.EXPIRED
                    log.info(f"Approval {approval.approval_id} expired")
                else:
                    pending.append(approval)
        
        return pending


def approve_request(
    approval_id: str,
    human_user_id: str,
    response_message: Optional[str] = None,
) -> tuple[bool, str]:
    """Approve a pending request.
    
    Args:
        approval_id: ID of the approval request
        human_user_id: ID of the human approver
        response_message: Optional message from approver
    
    Returns:
        (success, message) tuple
    """
    with _approval_lock:
        request = _pending_approvals.get(approval_id)
        
        if not request:
            return False, "Approval request not found"
        
        if request.status != ApprovalStatus.PENDING:
            return False, f"Request already {request.status.value}"
        
        # Check expiration
        if request.expires_at < datetime.now():
            request.status = ApprovalStatus.EXPIRED
            return False, "Request has expired"
        
        # Approve
        request.status = ApprovalStatus.APPROVED
        request.human_user_id = human_user_id
        request.human_response = response_message
        request.responded_at = datetime.now()
        
        log.info(f"Approval {approval_id} approved by {human_user_id}")
        return True, "Approved"


def reject_request(
    approval_id: str,
    human_user_id: str,
    response_message: Optional[str] = None,
) -> tuple[bool, str]:
    """Reject a pending request.
    
    Args:
        approval_id: ID of the approval request
        human_user_id: ID of the human approver
        response_message: Optional message from approver
    
    Returns:
        (success, message) tuple
    """
    with _approval_lock:
        request = _pending_approvals.get(approval_id)
        
        if not request:
            return False, "Approval request not found"
        
        if request.status != ApprovalStatus.PENDING:
            return False, f"Request already {request.status.value}"
        
        # Reject
        request.status = ApprovalStatus.REJECTED
        request.human_user_id = human_user_id
        request.human_response = response_message or "Rejected by human reviewer"
        request.responded_at = datetime.now()
        
        log.info(f"Approval {approval_id} rejected by {human_user_id}")
        return True, "Rejected"


def complete_request(
    approval_id: str,
    *,
    status: ApprovalStatus,
    response_message: Optional[str] = None,
) -> tuple[bool, str]:
    """Mark an approved request as terminal after resume attempt."""
    if status not in {ApprovalStatus.APPROVED, ApprovalStatus.REJECTED, ApprovalStatus.EXPIRED}:
        return False, "Invalid terminal status"
    with _approval_lock:
        request = _pending_approvals.get(approval_id)
        if not request:
            return False, "Approval request not found"
        request.status = status
        if response_message:
            request.human_response = response_message
        request.responded_at = datetime.now()
        return True, "Updated"


def cleanup_expired_approvals():
    """Remove expired approval requests from storage."""
    with _approval_lock:
        now = datetime.now()
        expired = [
            approval_id
            for approval_id, request in _pending_approvals.items()
            if request.expires_at < now or request.status != ApprovalStatus.PENDING
        ]
        
        for approval_id in expired:
            del _pending_approvals[approval_id]
        
        if expired:
            log.info(f"Cleaned up {len(expired)} expired/completed approvals")


def set_approval_policy(tool_name: str, policy: ApprovalPolicy):
    """Set approval policy for a tool/operation."""
    _approval_policies[tool_name] = policy
    log.info(f"Set approval policy for {tool_name}: {policy.value}")


def get_approval_policy(tool_name: str) -> ApprovalPolicy:
    """Get approval policy for a tool/operation."""
    return _approval_policies.get(tool_name, ApprovalPolicy.NEVER)


# ── Approval-Aware Execution Wrapper ────────────────────────────────
async def execute_with_approval_check(
    user_id: str,
    task_id: str,
    tool_name: str,
    operation_type: str,
    context: dict[str, Any],
    executor: Callable,
    timeout_seconds: int = 300,
) -> Any:
    """Execute operation with approval check if needed.
    
    If approval is required:
    1. Creates approval request
    2. Waits for human approval (up to timeout)
    3. Executes operation if approved
    4. Returns result or raises exception if rejected
    
    Args:
        user_id: User requesting operation
        task_id: Task ID
        tool_name: Tool name
        operation_type: Operation type
        context: Context for approval
        executor: Async callable to execute if approved
        timeout_seconds: How long to wait for approval
    
    Returns:
        Result from executor if approved
    
    Raises:
        ValueError: If approval is rejected or times out
    """
    import asyncio
    
    # Check if approval is needed
    if not _check_approval_needed(tool_name, context):
        # No approval needed, execute directly
        return await executor()
    
    # Create approval request
    request = create_approval_request(
        user_id=user_id,
        task_id=task_id,
        tool_name=tool_name,
        operation_type=operation_type,
        context=context,
        ttl_seconds=timeout_seconds,
    )
    
    log.info(f"Operation {tool_name} requires approval: {request.approval_id}")
    
    # Wait for approval
    start_time = datetime.now()
    check_interval = 1.0  # Check every second
    
    while True:
        # Check if timeout exceeded
        elapsed = (datetime.now() - start_time).total_seconds()
        if elapsed >= timeout_seconds:
            raise ValueError(
                f"Approval timeout: No response received for {request.approval_id} "
                f"after {timeout_seconds}s"
            )
        
        # Check approval status
        with _approval_lock:
            current_request = _pending_approvals.get(request.approval_id)
            
            if not current_request:
                raise ValueError(f"Approval request {request.approval_id} not found")
            
            if current_request.status == ApprovalStatus.APPROVED:
                log.info(f"Approval {request.approval_id} granted, executing operation")
                return await executor()
            
            elif current_request.status == ApprovalStatus.REJECTED:
                raise ValueError(
                    f"Operation rejected by human reviewer: "
                    f"{current_request.human_response}"
                )
            
            elif current_request.status == ApprovalStatus.EXPIRED:
                raise ValueError(f"Approval request {request.approval_id} expired")
        
        # Wait before checking again
        await asyncio.sleep(check_interval)


__all__ = [
    "ApprovalStatus",
    "ApprovalPolicy",
    "ApprovalRequest",
    "create_approval_request",
    "get_approval_request",
    "list_pending_approvals",
    "approve_request",
    "reject_request",
    "cleanup_expired_approvals",
    "complete_request",
    "set_approval_policy",
    "get_approval_policy",
    "execute_with_approval_check",
]
