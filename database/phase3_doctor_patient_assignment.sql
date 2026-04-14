-- Phase 3: Doctor-patient assignment table for scoped booking authorization

BEGIN;

CREATE TABLE IF NOT EXISTS doctor_patient_assignment (
    assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES usr(user_id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES usr(user_id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS idx_doctor_patient_assignment_doctor_active
    ON doctor_patient_assignment (doctor_id)
    WHERE deleted_at IS NULL AND is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_doctor_patient_assignment_patient_active
    ON doctor_patient_assignment (patient_id)
    WHERE deleted_at IS NULL AND is_active = TRUE;

CREATE UNIQUE INDEX IF NOT EXISTS uq_doctor_patient_assignment_active_pair
    ON doctor_patient_assignment (doctor_id, patient_id)
    WHERE deleted_at IS NULL AND is_active = TRUE;

COMMIT;
