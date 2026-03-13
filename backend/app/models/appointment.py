import uuid
from sqlalchemy import Column, ForeignKey, TIMESTAMP, Enum, Text, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base
from app.models.enums import AppointmentStatus

class Appointment(Base):
    __tablename__ = "appointment"

    appointment_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    patient_id = Column(
        UUID(as_uuid=True),
        ForeignKey("usr.user_id", ondelete="CASCADE"),
        nullable=False
    )

    doctor_id = Column(
        UUID(as_uuid=True),
        ForeignKey("usr.user_id", ondelete="CASCADE"),
        nullable=False
    )

    slot_id = Column(
        UUID(as_uuid=True),
        ForeignKey("time_slot.slot_id", ondelete="CASCADE"),
        nullable=False
    )

    status = Column(
        Enum(AppointmentStatus, name="appointment_status"),
        default=AppointmentStatus.scheduled,
        nullable=False
    )

    appointment_type = Column(Text, nullable=True)
    fee = Column(Numeric, nullable=True)

    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(TIMESTAMP, nullable=True)