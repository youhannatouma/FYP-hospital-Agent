-- Minimal seed helper for doctor_patient_assignment
-- Usage examples:
-- 1) Explicit IDs: replace the UUID placeholders below.
-- 2) Auto-pick mode: uncomment the auto-pick block to create one assignment
--    between the first active doctor and first active patient.

BEGIN;

-- ---------------------------------------------------------------------------
-- Option A: Explicit doctor_id + patient_id
-- ---------------------------------------------------------------------------
-- Replace both UUIDs, then run this block.
-- INSERT INTO doctor_patient_assignment (
--     doctor_id,
--     patient_id,
--     is_active,
--     reason
-- )
-- SELECT
--     '00000000-0000-0000-0000-000000000001'::uuid,
--     '00000000-0000-0000-0000-000000000002'::uuid,
--     TRUE,
--     'seed: initial assignment for scoped booking tests'
-- WHERE NOT EXISTS (
--     SELECT 1
--     FROM doctor_patient_assignment
--     WHERE doctor_id = '00000000-0000-0000-0000-000000000001'::uuid
--       AND patient_id = '00000000-0000-0000-0000-000000000002'::uuid
--       AND is_active = TRUE
--       AND deleted_at IS NULL
-- );

-- ---------------------------------------------------------------------------
-- Option B: Auto-pick first active doctor and first active patient
-- ---------------------------------------------------------------------------
WITH picked_doctor AS (
    SELECT user_id AS doctor_id
    FROM usr
    WHERE role = 'doctor' AND deleted_at IS NULL
    ORDER BY created_at ASC
    LIMIT 1
), picked_patient AS (
    SELECT user_id AS patient_id
    FROM usr
    WHERE role = 'patient' AND deleted_at IS NULL
    ORDER BY created_at ASC
    LIMIT 1
)
INSERT INTO doctor_patient_assignment (
    doctor_id,
    patient_id,
    is_active,
    reason
)
SELECT
    d.doctor_id,
    p.patient_id,
    TRUE,
    'seed: auto-picked doctor/patient for scoped booking tests'
FROM picked_doctor d
CROSS JOIN picked_patient p
WHERE NOT EXISTS (
    SELECT 1
    FROM doctor_patient_assignment a
    WHERE a.doctor_id = d.doctor_id
      AND a.patient_id = p.patient_id
      AND a.is_active = TRUE
      AND a.deleted_at IS NULL
);

COMMIT;
