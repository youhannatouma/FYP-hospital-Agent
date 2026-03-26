# Contributor Change Log

This document summarizes the implementation changes in this branch so contributors can quickly understand what was changed before/after push.

## Scope and intent

The main goals of these changes were:
- unify runtime database access to one project database configuration
- align medication ingestion and querying with the existing `medication` table fields
- modularize data preprocessing/seeding scripts for maintainability
- stabilize backend package imports and orchestration wiring
- document orchestration and data pipeline behavior

## Existing files modified

### Backend runtime and imports

- `backend/main.py`
  - Switched environment loading to read `.env` from repository root.
  - Updated imports to package-relative imports for safer module resolution.
  - Normalized memory snapshot path handling and ensured snapshot directory creation.

- `backend/memory/__init__.py`
  - Simplified package exports.
  - Added export alignment with real symbols in `memory_tools.py`.

- `backend/memory/memory_tools.py`
  - Added `recall_memory(...)` as a backward-compatible alias to `recall(...)`.

- `backend/middleware/__init__.py`
  - Simplified to submodule exports (`stream_manager`, `approval_manager`, `lock_manager`) to avoid stale symbol import issues.

- `backend/orchestration/__init__.py`
  - Simplified to submodule exports (`supervisor_routing`, `supervisor_workflow`, `execution_validator`) to reduce fragile top-level symbol coupling.

- `backend/orchestration/supervisor_workflow.py`
  - Updated imports to package-relative paths to prevent runtime import errors.

- `backend/tools/__init__.py`
  - Simplified tools package export to submodule export.

- `backend/tools/medication_tools.py`
  - Switched DB config to single `DB_*` settings.
  - Updated medication query path to use `medication` table fields:
    - `name`, `dosage`, `substances`, `warnings`, `contradictions`, `drug_interactions`
  - Updated profile/stock lookups to the same DB configuration.
  - Kept safety pipeline behavior while mapping medication-native schema.

### Database and infrastructure

- `database/SQL queries.pgsql`
  - Updated `medication` schema representation to medication-native safety fields:
    - removed legacy style fields (`frequency`, `duration`, `instructions`)
    - added/used `substances`, `warnings`, `contradictions`, `drug_interactions`

- `docker-compose.yml`
  - Postgres volume mount adjusted to match container expectations.
  - Host DB port changed from `5432` to `5433` to avoid local port conflicts.
  - Backend service environment map expanded for required runtime keys.

## New files created

### Packaging and project structure

- `backend/__init__.py`
  - Added backend package root marker for package-based imports.

### Data pipeline (modularized)

- `data_pipeline/preprocess_and_seed.py`
  - Orchestrator entrypoint for preprocessing and seeding.

- `data_pipeline/requirements.txt`
  - Pipeline dependencies: `pandas`, `numpy`, `psycopg2-binary`.

- `data_pipeline/README.md`
  - Usage and architecture guide for preprocessing + seed flow.

- `data_pipeline/create_drug_labels_table.sql`
  - Explicit deprecated/no-op helper note to prevent creating an unnecessary table.

- `data_pipeline/scripts/__init__.py`
  - Scripts package marker.

- `data_pipeline/scripts/config.py`
  - Shared constants and DB configuration loader.

- `data_pipeline/scripts/parse_source.py`
  - Source SQL parser supporting both COPY and INSERT dump styles.

- `data_pipeline/scripts/transform_for_medication.py`
  - Preprocess/filter/diversify logic using pandas/numpy and mapping to medication schema.

- `data_pipeline/scripts/seed_medication.py`
  - Batch insert implementation into `medication`.

### Documentation

- `docs/ORCHESTRATION_DETAILED_GUIDE.md`
  - Detailed explanation of orchestration architecture and file interactions.

## File removed

- `docs/PHASE3_SUMMARY.md`
  - Removed from this branch.

## Important contributor note: data pipeline retention

The `data_pipeline/` files are intentionally kept in the repository for reseeding scenarios only.

They are useful when:
- source data is refreshed
- medication rows must be regenerated after schema/content cleanup
- deterministic refill of `medication` is needed in development/staging

They are not part of model training/validation workflows.

## Operational note for local runs

If running against Docker Postgres from host tools/scripts, use host port `5433` (as defined in `docker-compose.yml`) unless your local environment has been changed.

## Suggested contributor workflow before push

1. Run dry-run first when reseeding:
   - `python data_pipeline/preprocess_and_seed.py --dry-run`
2. Run actual seed only when dry-run output is correct:
   - `python data_pipeline/preprocess_and_seed.py`
