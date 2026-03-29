-- Phase 2 hardening for doctor matching and booking safety.
-- Apply manually against the project database.

BEGIN;

-- 1) Doctor specialty and active-status lookup index.
CREATE INDEX IF NOT EXISTS idx_usr_doctor_specialty_status_active
    ON usr (role, specialty, status)
    WHERE deleted_at IS NULL;

-- 2) Available slot lookup index for doctor/date queries.
CREATE INDEX IF NOT EXISTS idx_time_slot_doctor_start_available
    ON time_slot (doctor_id, start_time)
    WHERE deleted_at IS NULL AND is_available = TRUE;

-- 3) Uniqueness guard for non-cancelled booked slots.
--    This enforces one active booking per slot at the DB level.
CREATE UNIQUE INDEX IF NOT EXISTS uq_appointment_active_slot
    ON appointment (slot_id)
    WHERE deleted_at IS NULL AND status IN ('scheduled', 'completed');

-- 4) Common read-path index for active appointment lookups.
CREATE INDEX IF NOT EXISTS idx_appointment_patient_doctor_active
    ON appointment (patient_id, doctor_id, status)
    WHERE deleted_at IS NULL;

COMMIT;
