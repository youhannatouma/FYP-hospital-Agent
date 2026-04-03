"""LangGraph-based supervisor workflow execution.

Phase 2 execution architecture:
- Typed state schema for complex workflows
- Stage planning via independence matrix
- Async execution with asyncio.to_thread for blocking tool calls

Phase 3 streaming architecture:
- SSE-based streaming with partial result yields
- Cancellation support via stream tokens
- Progress tracking for real-time UI updates
"""
from __future__ import annotations

import asyncio
import logging
from typing import Any, AsyncIterator, TypedDict

from langgraph.graph import END, START, StateGraph

from ..memory import memory_tools
from .supervisor_routing import ToolTask, build_parallel_stages, execute_parallel_plan
from ..middleware import stream_manager

log = logging.getLogger(__name__)


class SupervisorState(TypedDict, total=False):
    user_id: str
    task_specs: list[dict[str, Any]]
    planned_tasks: list[ToolTask]
    planned_stages: list[list[str]]
    raw_results: dict[str, Any]
    results: dict[str, Any]
    errors: list[str]


def _validate_and_build_tool_task(user_id: str, task_spec: dict[str, Any], index: int) -> ToolTask:
    task_id = task_spec.get("task_id") or f"task_{index}"
    tool_name = task_spec.get("tool_name")
    query = task_spec.get("query")
    k = int(task_spec.get("k", 5))
    facts = task_spec.get("facts") or []

    if tool_name == "add_facts":
        if not facts:
            raise ValueError(f"{task_id}: add_facts requires non-empty facts")

        async def run_add(_facts=facts):
            return await asyncio.to_thread(memory_tools.add_facts, user_id, _facts)

        return ToolTask(
            task_id=task_id,
            tool_name="add_facts",
            user_id=user_id,
            is_write=True,
            runner=run_add,
        )

    if tool_name == "recall_memory":
        if not query:
            raise ValueError(f"{task_id}: recall_memory requires query")

        async def run_recall(_query=query, _k=k):
            return await asyncio.to_thread(memory_tools.recall, user_id, _query, _k)

        return ToolTask(
            task_id=task_id,
            tool_name="recall_memory",
            user_id=user_id,
            is_write=False,
            runner=run_recall,
        )

    if tool_name == "memory_context":
        if not query:
            raise ValueError(f"{task_id}: memory_context requires query")

        async def run_context(_query=query, _k=k):
            return await asyncio.to_thread(memory_tools.memory_context, user_id, _query, _k)

        return ToolTask(
            task_id=task_id,
            tool_name="memory_context",
            user_id=user_id,
            is_write=False,
            runner=run_context,
        )

    if tool_name == "user_fact_count":
        async def run_count():
            return await asyncio.to_thread(memory_tools.user_fact_count, user_id)

        return ToolTask(
            task_id=task_id,
            tool_name="user_fact_count",
            user_id=user_id,
            is_write=False,
            runner=run_count,
        )

    if tool_name == "clear_user":
        async def run_clear():
            await asyncio.to_thread(memory_tools.clear_user, user_id)
            return {"cleared": True}

        return ToolTask(
            task_id=task_id,
            tool_name="clear_user",
            user_id=user_id,
            is_write=True,
            runner=run_clear,
        )

    raise ValueError(f"{task_id}: unsupported tool_name '{tool_name}'")


async def _plan_node(state: SupervisorState) -> SupervisorState:
    user_id = state["user_id"]
    task_specs = state.get("task_specs", [])
    if not task_specs:
        raise ValueError("tasks must not be empty")

    planned_tasks = [
        _validate_and_build_tool_task(user_id, spec, idx)
        for idx, spec in enumerate(task_specs, start=1)
    ]
    stages = build_parallel_stages(planned_tasks)
    return {
        "planned_tasks": planned_tasks,
        "planned_stages": [[t.task_id for t in s.tasks] for s in stages],
    }


async def _execute_node(state: SupervisorState) -> SupervisorState:
    planned_tasks = state.get("planned_tasks", [])
    stages = build_parallel_stages(planned_tasks)
    raw_results = await execute_parallel_plan(stages)
    return {"raw_results": raw_results}


def _normalize_node(state: SupervisorState) -> SupervisorState:
    raw_results = state.get("raw_results", {})
    results: dict[str, Any] = {}
    errors: list[str] = []

    for task_id, value in raw_results.items():
        if isinstance(value, Exception):
            err = {"error": str(value), "type": type(value).__name__}
            results[task_id] = err
            errors.append(f"{task_id}: {err['type']}: {err['error']}")
        else:
            results[task_id] = value

    return {"results": results, "errors": errors}


def _build_graph():
    graph = StateGraph(SupervisorState)
    graph.add_node("plan", _plan_node)
    graph.add_node("execute", _execute_node)
    graph.add_node("normalize", _normalize_node)
    graph.add_edge(START, "plan")
    graph.add_edge("plan", "execute")
    graph.add_edge("execute", "normalize")
    graph.add_edge("normalize", END)
    return graph.compile()


_WORKFLOW = _build_graph()


async def execute_supervisor_workflow(user_id: str, task_specs: list[dict[str, Any]]) -> dict[str, Any]:
    state: SupervisorState = {"user_id": user_id, "task_specs": task_specs}
    out = await _WORKFLOW.ainvoke(state)
    return {
        "user_id": user_id,
        "planned_stages": out.get("planned_stages", []),
        "results": out.get("results", {}),
        "errors": out.get("errors", []),
    }


async def stream_supervisor_workflow(
    user_id: str,
    task_specs: list[dict[str, Any]],
) -> AsyncIterator[dict[str, Any]]:
    """Streaming version of supervisor workflow with cancellation support.
    
    Yields:
        - {"type": "plan", "stages": [...]} after planning
        - {"type": "stage_start", "stage_index": N, "task_ids": [...]} before each stage
        - {"type": "stage_complete", "stage_index": N, "results": {...}} after each stage
        - {"type": "complete", "results": {...}, "errors": [...]} at the end
        - {"type": "cancelled"} if stream was cancelled
        - {"type": "error", "message": "..."} on error
    """
    cancel_token = stream_manager.create_stream_token(user_id)
    
    try:
        # Validate and build tasks
        if cancel_token.is_set():
            yield {"type": "cancelled"}
            return
        
        planned_tasks = [
            _validate_and_build_tool_task(user_id, spec, idx)
            for idx, spec in enumerate(task_specs, start=1)
        ]
        
        # Plan stages
        if cancel_token.is_set():
            yield {"type": "cancelled"}
            return
        
        stages = build_parallel_stages(planned_tasks)
        stage_ids = [[t.task_id for t in s.tasks] for s in stages]
        
        yield {
            "type": "plan",
            "stages": stage_ids,
            "total_stages": len(stages),
            "total_tasks": len(planned_tasks),
        }
        
        # Execute stages with streaming
        all_results: dict[str, Any] = {}
        
        for stage_index, stage in enumerate(stages, start=1):
            if cancel_token.is_set():
                yield {"type": "cancelled"}
                return
            
            task_ids = [t.task_id for t in stage.tasks]
            yield {
                "type": "stage_start",
                "stage_index": stage_index,
                "total_stages": len(stages),
                "task_ids": task_ids,
            }
            
            # Execute stage (parallel tasks)
            stage_results = {}
            try:
                # Run all tasks in stage concurrently
                task_results = await asyncio.gather(
                    *[task.runner() for task in stage.tasks],
                    return_exceptions=True,
                )
                
                for task, result in zip(stage.tasks, task_results):
                    if cancel_token.is_set():
                        yield {"type": "cancelled"}
                        return
                    
                    stage_results[task.task_id] = result
                    all_results[task.task_id] = result
                
            except Exception as e:
                log.error(f"Stage {stage_index} failed: {e}")
                stage_results["_stage_error"] = str(e)
            
            yield {
                "type": "stage_complete",
                "stage_index": stage_index,
                "total_stages": len(stages),
                "results": stage_results,
            }
        
        # Normalize results
        if cancel_token.is_set():
            yield {"type": "cancelled"}
            return
        
        normalized_results: dict[str, Any] = {}
        errors: list[str] = []
        
        for task_id, value in all_results.items():
            if isinstance(value, Exception):
                err = {"error": str(value), "type": type(value).__name__}
                normalized_results[task_id] = err
                errors.append(f"{task_id}: {err['type']}: {err['error']}")
            else:
                normalized_results[task_id] = value
        
        yield {
            "type": "complete",
            "results": normalized_results,
            "errors": errors,
            "stages": stage_ids,
        }
        
    except Exception as e:
        log.error(f"Streaming workflow failed for user {user_id}: {e}")
        yield {"type": "error", "message": str(e)}
    
    finally:
        stream_manager.remove_stream_token(user_id)


__all__ = ["SupervisorState", "execute_supervisor_workflow", "stream_supervisor_workflow"]
