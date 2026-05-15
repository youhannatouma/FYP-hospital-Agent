from sqlalchemy import Enum
import enum

# User roles
class UserRole(str, enum.Enum):
    admin = "admin"
    doctor = "doctor"
    patient = "patient"
    pharmacist = "pharmacist"
    lab = "lab"

# Appointment status
class AppointmentStatus(str, enum.Enum):
    scheduled = "scheduled"
    completed = "completed"
    cancelled = "cancelled"
