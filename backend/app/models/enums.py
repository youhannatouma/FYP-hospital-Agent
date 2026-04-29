from sqlalchemy import Enum
import enum

# User roles
class UserRole(str, enum.Enum):
    admin = "admin"
    doctor = "doctor"
    patient = "patient"

# Appointment status
class AppointmentStatus(str, enum.Enum):
    scheduled = "scheduled"
    accepted = "accepted"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"
