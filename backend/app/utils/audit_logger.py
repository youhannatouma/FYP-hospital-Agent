"""Audit logging utilities for recording security events."""

from typing import Optional, Any, Dict
from datetime import datetime
from sqlalchemy.orm import Session
from uuid import UUID

from app.models.audit_log import AuditLog, AuditEventType


def log_audit_event(
    db: Session,
    event_type: AuditEventType,
    user_id: Optional[UUID] = None,
    user_email: Optional[str] = None,
    user_role: Optional[str] = None,
    resource_id: Optional[UUID] = None,
    resource_type: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    status: str = "success",
    details: Optional[Dict[str, Any]] = None,
) -> AuditLog:
    """
    Log an audit event to the database.
    
    Args:
        db: Database session
        event_type: Type of event (from AuditEventType enum)
        user_id: ID of user performing action
        user_email: Email of user performing action
        user_role: Role of user performing action
        resource_id: ID of affected resource
        resource_type: Type of affected resource
        ip_address: IP address of request
        user_agent: User agent string
        status: Status of operation ('success', 'failure', 'blocked')
        details: Additional context as dict
    
    Returns:
        Created AuditLog object
    """
    try:
        audit_log = AuditLog(
            event_type=event_type,
            user_id=user_id,
            user_email=user_email,
            user_role=user_role,
            resource_id=resource_id,
            resource_type=resource_type,
            ip_address=ip_address,
            user_agent=user_agent,
            status=status,
            details=details or {},
        )
        
        db.add(audit_log)
        db.commit()
        db.refresh(audit_log)
        
        return audit_log
    except Exception as e:
        # Log to stderr instead of raising to prevent audit failures from breaking app
        import sys
        print(f"[AUDIT_ERROR] Failed to log event: {str(e)}", file=sys.stderr)
        raise


def log_login_attempt(
    db: Session,
    email: str,
    ip_address: Optional[str] = None,
    success: bool = False,
    reason: Optional[str] = None,
):
    """Log login attempt (success or failure)."""
    event_type = AuditEventType.LOGIN_SUCCESS if success else AuditEventType.LOGIN_FAILED
    status = "success" if success else "failure"
    
    return log_audit_event(
        db=db,
        event_type=event_type,
        user_email=email,
        ip_address=ip_address,
        status=status,
        details={"reason": reason} if reason else {},
    )


def log_unauthorized_access(
    db: Session,
    user_id: Optional[UUID] = None,
    user_email: Optional[str] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[UUID] = None,
    ip_address: Optional[str] = None,
    reason: str = "Insufficient permissions",
):
    """Log unauthorized access attempt."""
    return log_audit_event(
        db=db,
        event_type=AuditEventType.UNAUTHORIZED_ACCESS,
        user_id=user_id,
        user_email=user_email,
        resource_type=resource_type,
        resource_id=resource_id,
        ip_address=ip_address,
        status="blocked",
        details={"reason": reason},
    )


def log_medical_record_access(
    db: Session,
    event_type: AuditEventType,
    user_id: UUID,
    user_email: str,
    user_role: str,
    record_id: UUID,
    patient_id: UUID,
    ip_address: Optional[str] = None,
    success: bool = True,
):
    """Log medical record access or modification."""
    return log_audit_event(
        db=db,
        event_type=event_type,
        user_id=user_id,
        user_email=user_email,
        user_role=user_role,
        resource_id=record_id,
        resource_type="medical_record",
        ip_address=ip_address,
        status="success" if success else "failure",
        details={"patient_id": str(patient_id)},
    )


def log_role_change(
    db: Session,
    user_id: UUID,
    old_role: str,
    new_role: str,
    changed_by_user_id: UUID,
    changed_by_email: str,
    ip_address: Optional[str] = None,
):
    """Log role change for audit trail."""
    return log_audit_event(
        db=db,
        event_type=AuditEventType.ROLE_CHANGE,
        user_id=user_id,
        resource_type="user",
        resource_id=user_id,
        ip_address=ip_address,
        status="success",
        details={
            "old_role": old_role,
            "new_role": new_role,
            "changed_by": str(changed_by_user_id),
            "changed_by_email": changed_by_email,
        },
    )


def log_approval_decision(
    db: Session,
    approval_id: str,
    approver_id: UUID,
    approver_email: str,
    decision: str,  # 'approved' or 'rejected'
    reason: Optional[str] = None,
    ip_address: Optional[str] = None,
):
    """Log approval request decision."""
    event_type = (
        AuditEventType.APPROVAL_APPROVED
        if decision.lower() == "approved"
        else AuditEventType.APPROVAL_REJECTED
    )
    
    return log_audit_event(
        db=db,
        event_type=event_type,
        user_id=approver_id,
        user_email=approver_email,
        resource_type="approval_request",
        resource_id=UUID(approval_id) if isinstance(approval_id, str) else approval_id,
        ip_address=ip_address,
        status="success",
        details={"decision": decision, "reason": reason},
    )


def log_password_change(
    db: Session,
    user_id: UUID,
    user_email: str,
    ip_address: Optional[str] = None,
    reason: str = "User initiated",
):
    """Log password change."""
    return log_audit_event(
        db=db,
        event_type=AuditEventType.PASSWORD_CHANGED,
        user_id=user_id,
        user_email=user_email,
        resource_type="user",
        resource_id=user_id,
        ip_address=ip_address,
        status="success",
        details={"reason": reason},
    )


def log_admin_action(
    db: Session,
    admin_id: UUID,
    admin_email: str,
    action: str,
    resource_type: Optional[str] = None,
    resource_id: Optional[UUID] = None,
    ip_address: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
):
    """Log administrative action."""
    return log_audit_event(
        db=db,
        event_type=AuditEventType.ADMIN_ACTION,
        user_id=admin_id,
        user_email=admin_email,
        user_role="admin",
        resource_type=resource_type,
        resource_id=resource_id,
        ip_address=ip_address,
        status="success",
        details={**(details or {}), "action": action},
    )


__all__ = [
    "log_audit_event",
    "log_login_attempt",
    "log_unauthorized_access",
    "log_medical_record_access",
    "log_role_change",
    "log_approval_decision",
    "log_password_change",
    "log_admin_action",
]
