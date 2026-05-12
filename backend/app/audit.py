"""Audit logging integration for security event tracking.

Provides async audit logging for security-relevant events with
automatic user/IP extraction, JSONB context, and efficient batch writes.
"""

import logging
from typing import Any, Optional
from datetime import datetime
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import Request

from app.models.audit_log import AuditLog, AuditEventType


log = logging.getLogger("backend.audit")


class AuditLogger:
    """
    Centralized audit logging for security events.
    
    Logs security-relevant events to database for compliance and forensics.
    Automatically extracts user context from token and IP from request.
    """
    
    @staticmethod
    def _extract_user_info(user_id: Optional[str] = None, user_email: Optional[str] = None, 
                          user_role: Optional[str] = None) -> tuple[Optional[str], Optional[str], Optional[str]]:
        """
        Normalize user information.
        
        Args:
            user_id: User UUID
            user_email: User email
            user_role: User role
        
        Returns:
            Tuple of (user_id, user_email, user_role) with None values preserved
        """
        # Convert UUID to string if needed
        if user_id and isinstance(user_id, UUID):
            user_id = str(user_id)
        
        return user_id, user_email, user_role
    
    @staticmethod
    def _extract_request_info(request: Optional[Request]) -> tuple[Optional[str], Optional[str]]:
        """
        Extract IP address and user agent from request.
        
        Args:
            request: FastAPI Request object
        
        Returns:
            Tuple of (ip_address, user_agent)
        """
        ip_address = None
        user_agent = None
        
        if request:
            # Get client IP (handles X-Forwarded-For for proxies)
            if request.client:
                ip_address = request.client.host
            elif request.headers.get("x-forwarded-for"):
                # Take first IP from chain (client's original IP)
                ip_address = request.headers.get("x-forwarded-for").split(",")[0].strip()
            
            user_agent = request.headers.get("user-agent")
        
        return ip_address, user_agent
    
    @staticmethod
    async def log_event(
        db: Session,
        event_type: AuditEventType,
        user_id: Optional[str] = None,
        user_email: Optional[str] = None,
        user_role: Optional[str] = None,
        resource_id: Optional[str] = None,
        resource_type: Optional[str] = None,
        status: str = "success",
        details: Optional[dict[str, Any]] = None,
        request: Optional[Request] = None,
    ) -> AuditLog:
        """
        Log a security event.
        
        Args:
            db: SQLAlchemy database session
            event_type: Type of event from AuditEventType enum
            user_id: User UUID (optional)
            user_email: User email (optional)
            user_role: User role (optional)
            resource_id: Affected resource UUID (optional)
            resource_type: Type of affected resource (optional)
            status: Event status (success, failure, blocked)
            details: Additional context as dict (JSONB)
            request: FastAPI Request for IP/user-agent extraction (optional)
        
        Returns:
            Created AuditLog record
        
        Examples:
            # Login attempt
            await AuditLogger.log_event(
                db=db,
                event_type=AuditEventType.LOGIN_FAILED,
                user_email="user@example.com",
                status="failure",
                details={"reason": "Invalid credentials", "attempt": 3},
                request=request
            )
            
            # Medical record access
            await AuditLogger.log_event(
                db=db,
                event_type=AuditEventType.MEDICAL_RECORD_VIEW,
                user_id=current_user_id,
                resource_id=record_id,
                resource_type="medical_record",
                status="success",
                request=request
            )
        """
        try:
            # Extract user info
            user_id_norm, user_email_norm, user_role_norm = AuditLogger._extract_user_info(
                user_id, user_email, user_role
            )
            
            # Extract request info
            ip_address, user_agent = AuditLogger._extract_request_info(request)
            
            # Normalize resource ID
            if resource_id and isinstance(resource_id, UUID):
                resource_id = str(resource_id)
            
            # Create audit log entry
            audit_log = AuditLog(
                event_type=event_type,
                user_id=user_id_norm,
                user_email=user_email_norm,
                user_role=user_role_norm,
                resource_id=resource_id,
                resource_type=resource_type,
                ip_address=ip_address,
                user_agent=user_agent,
                status=status,
                details=details or {},
                created_at=datetime.utcnow(),
            )
            
            db.add(audit_log)
            db.commit()
            db.refresh(audit_log)
            
            log.info(
                f"Audit: {event_type.value} | user={user_email_norm} | "
                f"resource={resource_type}/{resource_id} | status={status}",
                extra={
                    "event_type": event_type.value,
                    "user_id": user_id_norm,
                    "ip_address": ip_address,
                    "status": status,
                }
            )
            
            return audit_log
        
        except Exception as e:
            log.error(f"Failed to write audit log: {e}", exc_info=True)
            # Don't raise - audit failure shouldn't block main operation
            return None
    
    @staticmethod
    async def log_login(
        db: Session,
        user_email: str,
        success: bool,
        request: Optional[Request] = None,
        details: Optional[dict[str, Any]] = None,
    ) -> None:
        """
        Log login attempt.
        
        Args:
            db: Database session
            user_email: User email
            success: Whether login succeeded
            request: Request object
            details: Additional details (attempts, etc.)
        """
        event_type = AuditEventType.LOGIN_SUCCESS if success else AuditEventType.LOGIN_FAILED
        status = "success" if success else "failure"
        
        await AuditLogger.log_event(
            db=db,
            event_type=event_type,
            user_email=user_email,
            status=status,
            details=details or {},
            request=request,
        )
    
    @staticmethod
    async def log_authorization_failure(
        db: Session,
        user_id: Optional[str] = None,
        user_email: Optional[str] = None,
        resource_id: Optional[str] = None,
        resource_type: Optional[str] = None,
        reason: str = "Unauthorized access",
        request: Optional[Request] = None,
    ) -> None:
        """
        Log unauthorized access attempt.
        
        Args:
            db: Database session
            user_id: User attempting access
            user_email: User email
            resource_id: Resource being accessed
            resource_type: Type of resource
            reason: Reason for denial
            request: Request object
        """
        await AuditLogger.log_event(
            db=db,
            event_type=AuditEventType.UNAUTHORIZED_ACCESS,
            user_id=user_id,
            user_email=user_email,
            resource_id=resource_id,
            resource_type=resource_type,
            status="blocked",
            details={"reason": reason},
            request=request,
        )
    
    @staticmethod
    async def log_data_access(
        db: Session,
        action: str,  # 'view', 'modify', 'delete', 'create'
        user_id: str,
        user_email: str,
        user_role: str,
        resource_id: str,
        resource_type: str,
        request: Optional[Request] = None,
        details: Optional[dict[str, Any]] = None,
    ) -> None:
        """
        Log data access for compliance (HIPAA for medical data).
        
        Args:
            db: Database session
            action: Action performed (view, modify, delete, create)
            user_id: User performing action
            user_email: User email
            user_role: User role
            resource_id: Resource ID
            resource_type: Resource type (medical_record, prescription, etc.)
            request: Request object
            details: Additional context
        """
        # Map action to event type
        event_map = {
            "create": f"{resource_type}_create",
            "view": f"{resource_type}_view",
            "modify": f"{resource_type}_modify",
            "delete": f"{resource_type}_delete",
        }
        
        event_name = event_map.get(action, "unknown_action")
        try:
            event_type = AuditEventType[event_name.upper()]
        except KeyError:
            # Fallback for unmapped event types
            event_type = AuditEventType.ADMIN_ACTION
        
        await AuditLogger.log_event(
            db=db,
            event_type=event_type,
            user_id=user_id,
            user_email=user_email,
            user_role=user_role,
            resource_id=resource_id,
            resource_type=resource_type,
            status="success",
            details=details or {},
            request=request,
        )
    
    @staticmethod
    async def log_admin_action(
        db: Session,
        user_id: str,
        action_description: str,
        target_user_id: Optional[str] = None,
        details: Optional[dict[str, Any]] = None,
        request: Optional[Request] = None,
    ) -> None:
        """
        Log administrative actions.
        
        Args:
            db: Database session
            user_id: Admin performing action
            action_description: What was done
            target_user_id: User affected by action (optional)
            details: Additional context
            request: Request object
        """
        await AuditLogger.log_event(
            db=db,
            event_type=AuditEventType.ADMIN_ACTION,
            user_id=user_id,
            resource_id=target_user_id,
            resource_type="user",
            status="success",
            details={
                "action": action_description,
                **(details or {})
            },
            request=request,
        )
