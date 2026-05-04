-- ─────────────────────────────────────────────────────────────
-- Hospital App Init Script
-- This runs ONCE when the Docker postgres container is created
-- with an empty data volume. SQLAlchemy create_all() handles
-- the actual table creation; this just ensures the pgcrypto
-- extension and the enum types exist so there are no conflicts.
-- ─────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create enum types only if they don't already exist.
-- SQLAlchemy will also try to create these, but having them
-- pre-created avoids race conditions.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_status') THEN
        CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled');
    END IF;
END
$$;
