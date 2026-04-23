from sqlalchemy.orm import Session
from app.models.appointment import Appointment
from app.models.enums import AppointmentStatus
from app.models.user import User
from app.models.time_slot import TimeSlot
from app.skills.validation_skill import ValidationSkill
from app.skills.authorization_skill import AuthorizationSkill
from app.skills.transaction_skill import TransactionSkill
from uuid import UUID, uuid4
import logging

log = logging.getLogger(__name__)

class BookingSkill:
    """
    Skill for handling all booking-related operations.
    Ensures consistent appointment lifecycle management.
    """

    @staticmethod
    def create_appointment(
        db: Session, 
        requester: User,
        patient_id: UUID, 
        doctor_id: UUID, 
        slot_id: UUID,
        appointment_type: str, 
        fee: float
    ) -> Appointment:
        # 1. Authorize
        AuthorizationSkill.authorize_role(requester, ["patient", "admin"])
        if str(requester.role) == "patient":
            AuthorizationSkill.authorize_ownership(requester, patient_id)

        # 2. Execute via Transaction
        with TransactionSkill.run_transaction(db):
            # A. Validate Doctor
            doctor = db.query(User).filter(User.user_id == doctor_id, User.role == "doctor").first()
            ValidationSkill.ensure_exists(doctor, "Doctor")

            # B. Validate Slot
            slot = db.query(TimeSlot).filter(
                TimeSlot.slot_id == slot_id, 
                TimeSlot.doctor_id == doctor_id
            ).first()
            
            ValidationSkill.ensure_exists(slot, "Time slot")
            ValidationSkill.validate_business_rule(slot.is_available, "This time slot is already taken")

            # C. Create Appointment
            appointment = Appointment(
                patient_id=patient_id,
                doctor_id=doctor_id,
                slot_id=slot_id,
                status=AppointmentStatus.scheduled,
                appointment_type=appointment_type,
                fee=fee,
                room_id=uuid4()
            )

            # D. Mark slot as unavailable
            slot.is_available = False

            db.add(appointment)
            log.info(f"BookingSkill: Created appointment {appointment.appointment_id} for patient {patient_id}")
            return appointment

    @staticmethod
    def get_patient_appointments(db: Session, user: User, patient_id: UUID):
        # Authorize: Must be the patient themselves, the doctor they are seeing (handled differently), or an admin
        AuthorizationSkill.authorize_role(user, ["patient", "admin", "doctor"])
        if str(user.role) == "patient":
            AuthorizationSkill.authorize_ownership(user, patient_id)
        
        return db.query(Appointment).filter(Appointment.patient_id == patient_id).all()

    @staticmethod
    def get_doctor_appointments(db: Session, user: User, doctor_id: UUID):
        AuthorizationSkill.authorize_role(user, ["doctor", "admin"])
        if str(user.role) == "doctor":
            AuthorizationSkill.authorize_ownership(user, doctor_id)

        return db.query(Appointment).filter(Appointment.doctor_id == doctor_id).all()

    @staticmethod
    def cancel_appointment(db: Session, user: User, appointment_id: UUID):
        appointment = db.query(Appointment).filter(Appointment.appointment_id == appointment_id).first()
        ValidationSkill.ensure_exists(appointment, "Appointment")
        
        # Authorize: Participant or admin
        AuthorizationSkill.authorize_resource_access(user, [appointment.patient_id, appointment.doctor_id])

        with TransactionSkill.run_transaction(db):
            appointment.status = AppointmentStatus.cancelled
            # Re-open the slot
            slot = db.query(TimeSlot).filter(TimeSlot.slot_id == appointment.slot_id).first()
            if slot:
                slot.is_available = True
            
            log.info(f"BookingSkill: Cancelled appointment {appointment_id}")
            return True

    @staticmethod
    def complete_appointment(db: Session, user: User, appointment_id: UUID):
        appointment = db.query(Appointment).filter(Appointment.appointment_id == appointment_id).first()
        ValidationSkill.ensure_exists(appointment, "Appointment")
        
        # Authorize: The assigned doctor or an admin
        AuthorizationSkill.authorize_role(user, ["doctor", "admin"])
        if str(user.role) == "doctor":
            AuthorizationSkill.authorize_ownership(user, appointment.doctor_id)

        with TransactionSkill.run_transaction(db):
            appointment.status = AppointmentStatus.completed
            log.info(f"BookingSkill: Completed appointment {appointment_id}")
            return True

