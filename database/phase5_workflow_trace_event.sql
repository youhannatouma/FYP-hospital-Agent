-- Phase 5: Workflow trace persistence table for auditability and observability

BEGIN;

CREATE TABLE IF NOT EXISTS workflow_trace_event (
    trace_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_family TEXT NOT NULL,
    thread_id TEXT NOT NULL,
    actor_user_id TEXT NULL,
    patient_user_id TEXT NULL,
    run_id TEXT NOT NULL,
    node_name TEXT NULL,
    event_type TEXT NOT NULL,
    sequence INTEGER NOT NULL,
    occurred_at TIMESTAMP NOT NULL DEFAULT NOW(),
    duration_ms INTEGER NULL,
    status TEXT NULL,
    payload_json JSONB NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_workflow_trace_event_run_sequence
    ON workflow_trace_event (workflow_family, run_id, sequence);

CREATE INDEX IF NOT EXISTS ix_workflow_trace_event_thread_occurred
    ON workflow_trace_event (thread_id, occurred_at);

CREATE INDEX IF NOT EXISTS ix_workflow_trace_event_family_occurred
    ON workflow_trace_event (workflow_family, occurred_at);

CREATE INDEX IF NOT EXISTS ix_workflow_trace_event_seek
    ON workflow_trace_event (workflow_family, thread_id, occurred_at, sequence, trace_id);

CREATE INDEX IF NOT EXISTS ix_workflow_trace_event_actor_thread
    ON workflow_trace_event (actor_user_id, thread_id);

CREATE INDEX IF NOT EXISTS ix_workflow_trace_event_patient_thread
    ON workflow_trace_event (patient_user_id, thread_id);

COMMIT;
