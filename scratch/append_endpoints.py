
content_to_append = """

# Doctor: accept appointment
@router.patch("/{appointment_id}/accept")
def accept_appointment(
    appointment_id: str,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_role("doctor"))],
):
    try:
        BookingSkill.accept_appointment(db, user, UUID(appointment_id))
        return {"message": "Accepted"}
    except Exception as e:
        raise ErrorHandlingSkill.handle(e)


# Doctor: start appointment
@router.patch("/{appointment_id}/start")
def start_appointment(
    appointment_id: str,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_role("doctor"))],
):
    try:
        BookingSkill.start_appointment(db, user, UUID(appointment_id))
        return {"message": "Started"}
    except Exception as e:
        raise ErrorHandlingSkill.handle(e)
"""

with open(r'c:\fyp\FYP-hospital-Agent\backend\app\routes\appointments.py', 'a') as f:
    f.write(content_to_append)
print("Successfully appended endpoints")
