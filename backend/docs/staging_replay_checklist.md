# Staging Replay Checklist

## Goal
Validate specialized doctor workflow behavior across multi-turn sessions with no duplicate bookings and correct conditional transitions.

## Preconditions
1. Staging DB is seeded with known actor/patient/doctor users and at least one available timeslot.
2. Backend is running with specialized endpoints enabled.
3. Scenario template in `backend/scripts/staging_replay_scenarios.json` has been updated with real staging IDs and expected doctor names.

## Execute
1. Run replay harness:
   - `python backend/scripts/staging_replay_doctor_workflow.py --base-url https://<staging-host> --scenario-file backend/scripts/staging_replay_scenarios.json --output-file backend/scripts/staging_replay_report.json`
2. Capture output report and logs for the run window.
3. Re-run the same replay once to validate idempotent behavior stability.

## Pass Criteria
1. No duplicate `appointment_id` values are reported by harness.
2. Suggest-only turn returns `booking_mode=suggest_only` with blocked reason present.
3. Booking turn commits exactly once for equivalent repeated requests (same thread).
4. Retry turn keeps the same appointment outcome without creating duplicates.
5. Conflict turn does not create second booking for already consumed slot/time.
6. Replay report contains `thread_id`, `booking_mode`, `booking_committed`, `booking_blocked_reason`, and `appointment_id` extraction for each scenario.

## Manual Verification
1. Confirm backend logs include telemetry events for `workflow_started`, `booking_attempted`, `booking_denied`/`booking_committed`, `workflow_completed`.
2. Confirm fallback telemetry events only appear when specialized path runtime failures occur.
3. Validate cancellation endpoint behavior for one active stream (`/supervisor/doctor/cancel/{actor_user_id}`).

## Failure Triage Template
1. Scenario name
2. thread_id
3. Endpoint and payload hash
4. Returned booking_mode / booking_result code
5. Duplicate appointment IDs observed (if any)
6. Relevant telemetry event fragments (timestamp + event_name + thread hash)
