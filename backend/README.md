# Backend Architecture

This directory contains the supervisor orchestration system backend, organized into logical packages for maintainability and team collaboration.

## 📁 Folder Structure

```
backend/
├── orchestration/     # Workflow planning, execution, and validation
│   ├── __init__.py
│   ├── supervisor_routing.py      # Independence matrix & parallel planning
│   ├── supervisor_workflow.py     # LangGraph state-based execution
│   └── execution_validator.py     # Phase 4 sequence validation
│
├── memory/            # Dual memory system
│   ├── __init__.py
│   ├── memory_tools.py            # Long-term semantic memory (FAISS)
│   └── memory_window.py           # Short-term conversation buffer
│
├── tools/             # External tool integrations
│   ├── __init__.py
│   └── medication_tools.py        # Drug information queries
│
├── middleware/        # Cross-cutting infrastructure
│   ├── __init__.py
│   ├── stream_manager.py          # SSE streaming + rate limiting
│   ├── approval_manager.py        # Human-in-the-loop approvals
│   └── lock_manager.py            # Deadlock-safe locking
│
├── main.py           # FastAPI application entry point
└── requirements.txt  # Python dependencies
```

## 🧩 Package Descriptions

### `orchestration/`
**Core workflow orchestration logic**

- **supervisor_routing.py**: Implements the independence matrix that determines which operations can run safely in parallel. Prevents conflicts like `add_facts` + `recall_memory`.
- **supervisor_workflow.py**: LangGraph-based execution engine with SSE streaming support, cancellation tokens, and progress tracking.
- **execution_validator.py**: Phase 4 validation system that ensures execution sequences respect dependencies, handle errors correctly, and maintain state consistency.

### `memory/`
**User context management**

- **memory_tools.py**: Long-term semantic memory using FAISS vector search + FastEmbed embeddings. Thread-safe with per-user sessions.
- **memory_window.py**: Short-term conversation window with sliding buffer and LLM-powered summarization for context retention.

### `tools/`
**External integrations**

- **medication_tools.py**: Drug information queries using PostgreSQL + SQLAlchemy with connection pooling. Includes safety checks and interaction warnings.

*Future additions: appointment scheduling, provider search, lab results, etc.*

### `middleware/`
**Infrastructure & cross-cutting concerns**

- **stream_manager.py**: Manages SSE (Server-Sent Events) streams with automatic cancellation on reprompt and token bucket rate limiting (10 req/min + 5 burst).
- **approval_manager.py**: Human-in-the-loop (HITL) system for escalating risky operations. Configurable policies: ALWAYS, NEVER, RISKY, THRESHOLD.
- **lock_manager.py**: Deadlock prevention via ordered lock acquisition. Fixed order: session → memory → supervisor.

## 🔀 Specialized Endpoint Split

The backend now provides dedicated doctor-workflow endpoints in addition to the legacy multiplexed endpoints.

### Dedicated doctor endpoints

- `POST /supervisor/doctor/route`
- `POST /supervisor/doctor/stream`
- `POST /supervisor/doctor/cancel/{actor_user_id}`

### Legacy multiplexed endpoints (compatibility)

- `POST /supervisor/route`
- `POST /supervisor/stream`

Doctor payloads are still accepted on legacy endpoints during a 3-month compatibility window.

### Why specialized endpoints were added

1. **Clearer contracts**: dedicated URLs remove union-payload ambiguity and make request validation simpler.
2. **Correct stream cancellation scope**: doctor workflows are actor-scoped; dedicated cancel route maps directly to `actor_user_id`.
3. **Safer authorization and audit boundaries**: specialized paths isolate doctor booking-on-behalf behavior and policy checks.
4. **Cleaner observability**: route-level metrics and logs can distinguish generic orchestration from specialized medical-booking flow.
5. **Frontend simplicity**: clients can route explicitly by intent rather than relying on backend payload branching.

### Migration policy

1. Frontend should migrate doctor flow calls to dedicated URLs behind a feature flag.
2. Legacy endpoint doctor usage is deprecated and emits warnings in backend logs.
3. After the 3-month window, doctor payload support on legacy multiplexed endpoints will be removed.

## 🚀 Import Examples

```python
# Main application
from orchestration.supervisor_workflow import execute_supervisor_workflow, stream_supervisor_workflow
from memory import memory_tools
from middleware import stream_manager, approval_manager

# Tool integrations
from tools.medication_tools import medication_search, medication_detail

# Workflow planning
from orchestration.supervisor_routing import build_parallel_stages, can_run_in_parallel

# Validation
from orchestration.execution_validator import ExecutionValidator, create_validator
```

## 📊 System Status

- **Phase 1**: Thread safety + DB pooling ✅
- **Phase 2**: Parallel execution + independence matrix ✅
- **Phase 3**: SSE streaming + cancellation + rate limiting ✅
- **Phase 3 Final**: Human approval escalation (HITL) ✅
- **Phase 4**: Execution sequence validation ✅
- **Testing**: 11/13 passing (85%) - ✅ DEPLOYMENT READY

## 🔧 Development

**Running the server:**
```bash
cd backend
uvicorn main:app --reload --port 8000
```

**Running tests:**
```bash
python comprehensive_integration_test.py
```

## 📡 Specialized SSE Contract Notes

For specialized doctor-match streaming responses, field names are being aligned for clearer semantics.

- New field: `booking_blocked_missing_fields` (preferred)
- Legacy field: `booking_missing_fields` (temporary compatibility)
- New field: `booking_failed_validation` (true only for validation/policy/domain booking failures)

### Migration Guidance

1. Clients should read `booking_blocked_missing_fields` as the canonical missing-fields list.
2. Clients may continue to read `booking_missing_fields` during the migration window.
3. `booking_failed_validation` should be used to distinguish actionable validation failures from runtime/system failures.

### Deprecation Note

`booking_missing_fields` is deprecated and retained only for backward compatibility.
Plan to remove it in a follow-up cleanup release after frontend consumers complete migration.

## 📈 Structured Telemetry and Rollout Flags

The specialized workflow now includes structured telemetry hooks and rollout controls so production behavior can be observed and safely migrated.

### Why this was added

1. **Thread-level observability**: track one workflow from request through ranking to booking outcome.
2. **Actionable denial analytics**: aggregate booking denial reasons instead of only reading error logs.
3. **Safer rollout**: canary and fallback controls reduce blast radius while moving traffic.
4. **Faster rollback**: feature flags allow behavior changes without redeploy.

### Telemetry events (high level)

- `endpoint_selection`
- `workflow_started`
- `doctor_search_initiated`
- `ranking_emitted`
- `stage_completed`
- `booking_attempted`
- `booking_denied`
- `booking_committed`
- `fallback_triggered`
- `workflow_completed`
- `workflow_failed`

### Telemetry and rollout environment flags

- `TELEMETRY_ENABLED=false`
- `TELEMETRY_SAMPLE_RATE=0.10`
- `TELEMETRY_PII_MASKING=true`
- `TELEMETRY_SINK=stdout`
- `SPECIALIZED_DOCTOR_ROLLOUT_MODE=shadow` (`off|shadow|canary|on`)
- `SPECIALIZED_DOCTOR_CANARY_PERCENT=5`
- `SPECIALIZED_DOCTOR_AUTO_FALLBACK=true`
- `SPECIALIZED_DOCTOR_FALLBACK_REASON_LOGGING=true`

### Operational guidance

1. Start with `TELEMETRY_ENABLED=true` and low sample rate (for example `0.01`) in staging.
2. Keep PII masking enabled in all shared environments.
3. Move rollout mode from `shadow` to `canary` before `on`.
4. Keep auto fallback enabled during migration windows.

## 📝 Key Design Principles

1. **Thread Safety**: All shared state protected with RLocks
2. **Connection Pooling**: SQLAlchemy QueuePool for efficient DB access
3. **Parallel Safety**: Independence matrix prevents conflicting operations
4. **Real-time Updates**: SSE streaming for live progress tracking
5. **Human Oversight**: HITL approval system for sensitive operations
6. **Validation**: Phase 4 validator ensures execution integrity

## 🤝 Contributing

When adding new features:
- Place workflow logic in `orchestration/`
- Place memory systems in `memory/`
- Place external integrations in `tools/`
- Place infrastructure concerns in `middleware/`
- Update the independence matrix in `supervisor_routing.py` for new blocking pairs
- Add approval policies in `approval_manager.py` for sensitive operations
- Include validation rules in `execution_validator.py` for new sequences
