from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.appointment import Appointment
from app.schemas.appointment import AppointmentCreate
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/appointments", tags=["Appointments"])

@router.post("/")
def book_appointment(appt: AppointmentCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # Check if the doctor is already booked at the given time
    existing_appointment = db.query(Appointment).filter(
        Appointment.doctor_id == appt.doctor_id,
        Appointment.date == appt.date
    ).first()
    if existing_appointment:
        raise HTTPException(status_code=400, detail="Doctor already booked at this time")
    
    new_appointment = Appointment(**appt.dict())
    db.add(new_appointment)
    db.commit()
    return {"message": "Appointment booked successfully"}
