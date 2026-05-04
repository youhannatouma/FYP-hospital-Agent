-- Phase 4: Address geodata fields for distance-based proximity ranking

BEGIN;

ALTER TABLE usr
    ADD COLUMN IF NOT EXISTS clinic_latitude DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS clinic_longitude DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS patient_latitude DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS patient_longitude DOUBLE PRECISION;

CREATE INDEX IF NOT EXISTS idx_usr_clinic_geo_active
    ON usr (clinic_latitude, clinic_longitude)
    WHERE deleted_at IS NULL
      AND role = 'doctor'
      AND clinic_latitude IS NOT NULL
      AND clinic_longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_usr_patient_geo_active
    ON usr (patient_latitude, patient_longitude)
    WHERE deleted_at IS NULL
      AND role = 'patient'
      AND patient_latitude IS NOT NULL
      AND patient_longitude IS NOT NULL;

COMMIT;
