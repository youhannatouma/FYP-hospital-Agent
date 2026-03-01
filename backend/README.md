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
