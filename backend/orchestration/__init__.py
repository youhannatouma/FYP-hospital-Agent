"""Workflow Orchestration Package.

This package contains the core orchestration logic for the supervisor system:

- supervisor_routing.py: Independence matrix and parallel stage planning
- supervisor_workflow.py: LangGraph-based workflow execution with SSE streaming
- execution_validator.py: Execution sequence validation and integrity checking

The orchestration layer intelligently plans and executes multi-tool workflows
while respecting safety constraints and providing real-time progress updates.
"""

from .supervisor_routing import (
    ToolTask,
    ParallelStage,
    build_parallel_stages,
    execute_parallel_plan,
    can_run_in_parallel,
)

from .supervisor_workflow import (
    SupervisorState,
    execute_supervisor_workflow,
    stream_supervisor_workflow,
)

from .execution_validator import (
    ExecutionValidator,
    ExecutionTrace,
    create_validator,
)

__all__ = [
    # Routing
    "ToolTask",
    "ParallelStage",
    "build_parallel_stages",
    "execute_parallel_plan",
    "can_run_in_parallel",
    # Workflow
    "SupervisorState",
    "execute_supervisor_workflow",
    "stream_supervisor_workflow",
    # Validation
    "ExecutionValidator",
    "ExecutionTrace",
    "create_validator",
]
