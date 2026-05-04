from fastapi import APIRouter, Depends
from typing import Annotated, List, Union
from sqlalchemy.orm import Session
from datetime import date

from app.database import get_db
from app.models.user import User
from app.models.appointment import Appointment
from app.auth.dependencies import require_role

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/stats")
def admin_stats(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_role("admin"))]
):
    """Return simple statistics for administration dashboard."""
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.status == "Active").count()
    # we currently don't store the appointment date on the appointment itself;
    # fall back to counting all appointments as "today" for now
    appointments_today = db.query(Appointment).count()
    # revenue: sum of fees, cast to float
    fees = db.query(Appointment).with_entities(Appointment.fee).all()
    revenue = sum(float(r[0] or 0) for r in fees)
    return {
        "totalUsers": total_users,
        "activeUsers": active_users,
        "appointmentsToday": appointments_today,
        "revenue": revenue,
    }

@router.post("/sync-clerk")
def sync_clerk_users(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_role(["admin", "doctor"]))]
):
    """
    Manually sync all users from Clerk to the local database via ClerkSyncSkill.
    """
    from app.auth.dependencies import clerk
    from app.skills.clerk_sync_skill import ClerkSyncSkill
    
    try:
        count = ClerkSyncSkill.sync_all_users(db, clerk)
        return {"message": f"Successfully synced {count} users from Clerk"}
    except Exception as e:
        return {"message": f"Sync failed: {str(e)}"}, 500
