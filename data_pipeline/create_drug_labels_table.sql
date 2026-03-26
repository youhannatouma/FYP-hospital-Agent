-- ============================================================
-- Deprecated helper file
--
-- The pipeline now seeds data into the existing FYP medication table.
-- Do not create a new drug_labels table for this workflow.
--
-- Existing target schema:
--   medication(name, dosage, substances, warnings, contradictions, drug_interactions)
-- ============================================================

SELECT 'No-op: use data_pipeline/preprocess_and_seed.py to seed medication table only.';
