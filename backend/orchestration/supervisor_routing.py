"""Parallel routing decision tree and execution planner.

Phase 2 scope:
- Build safe parallel stages based on an independence matrix.
- Explicitly prevent `add_facts` and `recall_memory` from running in parallel.
- Keep execution deterministic and easy to audit.
"""
from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from typing import Any, Awaitable, Callable


ToolRunner = Callable[[], Awaitable[Any]]


@dataclass(frozen=True)
class ToolTask:
    """Declarative task used by the supervisor planner.

    Attributes:
        task_id: unique identifier for traceability.
        tool_name: symbolic tool action (e.g., 'recall_memory').
        user_id: user scope for write/read conflict checks.
        is_write: whether this task mutates user state.
        runner: async callable to execute the task.
    """

    task_id: str
    tool_name: str
    user_id: str
    is_write: bool
    runner: ToolRunner


@dataclass
class PlannedStage:
    """A stage of tasks that can run in parallel."""

    tasks: list[ToolTask] = field(default_factory=list)


# Independence matrix constraints (unordered pairs)
# If a pair is in this set, they MUST NOT run in parallel.
_BLOCKED_PARALLEL_PAIRS: set[frozenset[str]] = {
    frozenset({"add_facts", "recall_memory"}),
    frozenset({"add_facts", "memory_context"}),
    frozenset({"add_facts", "add_facts"}),
    frozenset({"schedule_appointment", "send_reminder"}),
}


def _blocked_by_matrix(a: ToolTask, b: ToolTask) -> bool:
    return frozenset({a.tool_name, b.tool_name}) in _BLOCKED_PARALLEL_PAIRS


def _blocked_by_data_conflict(a: ToolTask, b: ToolTask) -> bool:
    """Block parallelism for same-user write conflicts.

    Rules:
    - Same user + at least one write => block
    - Different users => allowed unless blocked by matrix
    """
    if a.user_id != b.user_id:
        return False
    return a.is_write or b.is_write


def can_run_in_parallel(a: ToolTask, b: ToolTask) -> bool:
    """Decision-tree check for pairwise parallel eligibility."""
    if _blocked_by_matrix(a, b):
        return False
    if _blocked_by_data_conflict(a, b):
        return False
    return True


def build_parallel_stages(tasks: list[ToolTask]) -> list[PlannedStage]:
    """Greedy deterministic planner for safe parallel execution.

    Preserves input order while packing tasks into earliest legal stage.
    """
    stages: list[PlannedStage] = []

    for task in tasks:
        placed = False
        for stage in stages:
            if all(can_run_in_parallel(task, existing) for existing in stage.tasks):
                stage.tasks.append(task)
                placed = True
                break
        if not placed:
            stages.append(PlannedStage(tasks=[task]))

    return stages


async def execute_parallel_plan(stages: list[PlannedStage]) -> dict[str, Any]:
    """Execute planned stages; each stage runs in parallel, stages run serially.

    Returns dict keyed by `task_id`.
    """
    results: dict[str, Any] = {}

    for stage in stages:
        parallel = await asyncio.gather(
            *(task.runner() for task in stage.tasks),
            return_exceptions=True,
        )
        for task, result in zip(stage.tasks, parallel):
            results[task.task_id] = result

    return results


__all__ = [
    "ToolTask",
    "PlannedStage",
    "can_run_in_parallel",
    "build_parallel_stages",
    "execute_parallel_plan",
]
