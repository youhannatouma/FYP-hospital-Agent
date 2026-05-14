"""Audit logging model for tracking security-relevant events."""

from sqlalchemy import Column, Text, DateTime, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid
import enum

from app.database import Base


class AuditEventType(str, enum.Enum):
    """Types of security events to audit."""
    LOGIN_SUCCESS = "login_success"
    LOGIN_FAILED = "login_failed"
    LOGOUT = "logout"
    UNAUTHORIZED_ACCESS = "unauthorized_access"
    ROLE_CHANGE = "role_change"
    MEDICAL_RECORD_CREATE = "medical_record_create"
    MEDICAL_RECORD_VIEW = "medical_record_view"
    MEDICAL_RECORD_MODIFY = "medical_record_modify"
    MEDICAL_RECORD_DELETE = "medical_record_delete"
    PRESCRIPTION_CREATE = "prescription_create"
    PRESCRIPTION_VIEW = "prescription_view"
    PRESCRIPTION_MODIFY = "prescription_modify"
    PAYMENT_CREATE = "payment_create"
    PAYMENT_MODIFY = "payment_modify"
    APPROVAL_REQUEST = "approval_request"
    APPROVAL_APPROVED = "approval_approved"
    APPROVAL_REJECTED = "approval_rejected"
    DATA_EXPORT = "data_export"
    ACCOUNT_LOCKED = "account_locked"
    ACCOUNT_UNLOCKED = "account_unlocked"
    PASSWORD_CHANGED = "password_changed"
    PERMISSION_GRANTED = "permission_granted"
    PERMISSION_REVOKED = "permission_revoked"
    ADMIN_ACTION = "admin_action"
    CONFIGURATION_CHANGED = "configuration_changed"
    ERROR = "error"


class AuditLog(Base):
    """
    Central audit log table for security event tracking.
    
    Tracks all security-relevant operations for compliance and forensics.
    """
    __tablename__ = "audit_log"

    log_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Event classification
    event_type = Column(
        SQLEnum(AuditEventType, name="audit_event_type"),
        nullable=False,
        index=True
    )
    
    # Actor information
    user_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    user_email = Column(Text, nullable=True)
    user_role = Column(Text, nullable=True)
    
    # Resource information
    resource_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    resource_type = Column(Text, nullable=True)  # 'medical_record', 'prescription', etc.
    
    # Request information
    ip_address = Column(Text, nullable=True, index=True)
    user_agent = Column(Text, nullable=True)
    
    # Result of operation
    status = Column(Text, nullable=False)  # 'success', 'failure', 'blocked'
    
    # Additional context (JSON)
    details = Column(JSONB, nullable=True)
    # Example details:
    # {
    #   "reason": "Invalid credentials",
    #   "attempt": 3,
    #   "old_value": "patient",
    #   "new_value": "doctor",
    #   "error": "Resource not found",
    #   "action_description": "User attempted to create medical record"
    # }
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False, index=True)
    
    def __repr__(self):
        return (
            f"<AuditLog(log_id={self.log_id}, event_type={self.event_type}, "
            f"user_id={self.user_id}, status={self.status}, created_at={self.created_at})>"
        )
