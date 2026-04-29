import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Numeric, Text
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.sql import func

from app.database import Base


class Medication(Base):
    __tablename__ = "medication"

    medication_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(Text)
    dosage = Column(Text)
    substances = Column(ARRAY(Text))
    warnings = Column(Text)
    contradictions = Column(Text)
    drug_interactions = Column(Text)


class Pharmacy(Base):
    __tablename__ = "pharmacy"

    pharmacy_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(Text)
    address = Column(Text)
    phone_number = Column(Text)
    opening_hours = Column(Text)
    open_24_hours = Column(Boolean)


class PharmacyInventory(Base):
    __tablename__ = "pharmacy_inventory"

    inventory_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pharmacy_id = Column(UUID(as_uuid=True), ForeignKey("pharmacy.pharmacy_id", ondelete="CASCADE"))
    medication_id = Column(UUID(as_uuid=True), ForeignKey("medication.medication_id", ondelete="CASCADE"))
    quantity_available = Column(Integer)
    price = Column(Numeric)
    last_updated = Column(DateTime, default=func.now(), onupdate=func.now())

