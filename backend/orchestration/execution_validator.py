"""Phase 4: Execution Sequence Validation & Integrity Checker.

Validates:
- Workflow execution order correctness
- Dependency respect (independence matrix)
- State transition validity
- Parallel execution safety
- Error handling robustness
- Complete end-to-end flow integrity
"""
from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass
from typing import Any, Optional

log = logging.getLogger(__name__)


@dataclass
class ExecutionTrace:
    """Records execution trace for validation."""
    task_id: str
    tool_name: str
    stage_index: int
    start_time: float
    end_time: Optional[float] = None
    success: bool = True
    error: Optional[str] = None
    parallel_with: list[str] = None
    
    def __post_init__(self):
        if self.parallel_with is None:
            self.parallel_with = []


class ExecutionValidator:
    """Validates workflow execution sequences and integrity."""
    
    def __init__(self):
        self.traces: list[ExecutionTrace] = []
        self.independence_violations: list[str] = []
        self.ordering_violations: list[str] = []
        self.state_violations: list[str] = []
    
    def record_execution(
        self,
        task_id: str,
        tool_name: str,
        stage_index: int,
        start_time: float,
        end_time: float,
        success: bool,
        error: Optional[str] = None,
        parallel_with: Optional[list[str]] = None,
    ):
        """Record a task execution."""
        trace = ExecutionTrace(
            task_id=task_id,
            tool_name=tool_name,
            stage_index=stage_index,
            start_time=start_time,
            end_time=end_time,
            success=success,
            error=error,
            parallel_with=parallel_with or [],
        )
        self.traces.append(trace)
    
    def validate_stage_ordering(self) -> bool:
        """Validate that stages execute in correct order.
        
        Rules:
        - Stage N must complete before stage N+1 starts
        - No stage should start before previous stage completes
        """
        if not self.traces:
            return True
        
        # Group by stage
        stages: dict[int, list[ExecutionTrace]] = {}
        for trace in self.traces:
            if trace.stage_index not in stages:
                stages[trace.stage_index] = []
            stages[trace.stage_index].append(trace)
        
        # Check ordering
        stage_indices = sorted(stages.keys())
        
        for i in range(len(stage_indices) - 1):
            current_stage = stage_indices[i]
            next_stage = stage_indices[i + 1]
            
            # Get latest end time of current stage
            current_traces = stages[current_stage]
            latest_end = max(t.end_time for t in current_traces if t.end_time)
            
            # Get earliest start time of next stage
            next_traces = stages[next_stage]
            earliest_start = min(t.start_time for t in next_traces)
            
            # Validate ordering
            if earliest_start < latest_end:
                violation = (
                    f"Stage {next_stage} started before stage {current_stage} completed: "
                    f"next_start={earliest_start:.3f}, current_end={latest_end:.3f}"
                )
                self.ordering_violations.append(violation)
                log.error(f"ORDERING VIOLATION: {violation}")
                return False
        
        return True
    
    def validate_independence_matrix(self) -> bool:
        """Validate that parallel tasks respect independence rules.
        
        Rules from independence matrix:
        - add_facts cannot run parallel with recall_memory
        - add_facts cannot run parallel with memory_context
        - clear_user cannot run parallel with any memory operation
        """
        blocked_pairs = {
            ("add_facts", "recall_memory"),
            ("add_facts", "memory_context"),
            ("add_facts", "clear_user"),
            ("recall_memory", "clear_user"),
            ("memory_context", "clear_user"),
            ("user_fact_count", "clear_user"),
        }
        
        # Check each stage for violations
        stages: dict[int, list[ExecutionTrace]] = {}
        for trace in self.traces:
            if trace.stage_index not in stages:
                stages[trace.stage_index] = []
            stages[trace.stage_index].append(trace)
        
        for stage_index, traces in stages.items():
            # Check all pairs in this stage
            tools_in_stage = [t.tool_name for t in traces]
            
            for i, tool1 in enumerate(tools_in_stage):
                for tool2 in tools_in_stage[i + 1:]:
                    pair = tuple(sorted([tool1, tool2]))
                    
                    if pair in blocked_pairs:
                        violation = (
                            f"Stage {stage_index}: Parallel execution of blocked pair: "
                            f"{tool1} + {tool2}"
                        )
                        self.independence_violations.append(violation)
                        log.error(f"INDEPENDENCE VIOLATION: {violation}")
                        return False
        
        return True
    
    def validate_state_consistency(self, expected_results: dict[str, Any]) -> bool:
        """Validate that execution results match expected state.
        
        Checks:
        - All expected tasks completed
        - No unexpected task executions
        - Results are consistent
        """
        executed_tasks = {t.task_id for t in self.traces}
        expected_tasks = set(expected_results.keys())
        
        # Check for missing tasks
        missing = expected_tasks - executed_tasks
        if missing:
            violation = f"Expected tasks not executed: {missing}"
            self.state_violations.append(violation)
            log.error(f"STATE VIOLATION: {violation}")
            return False
        
        # Check for unexpected tasks
        unexpected = executed_tasks - expected_tasks
        if unexpected:
            violation = f"Unexpected tasks executed: {unexpected}"
            self.state_violations.append(violation)
            log.warning(f"STATE WARNING: {violation}")
        
        return True
    
    def validate_error_handling(self) -> bool:
        """Validate that errors are handled correctly.
        
        Rules:
        - Failed tasks should have error messages
        - Successful tasks should not have errors
        - Errors should not propagate to wrong tasks
        """
        for trace in self.traces:
            if not trace.success and not trace.error:
                violation = f"Task {trace.task_id} failed but no error recorded"
                self.state_violations.append(violation)
                log.error(f"ERROR HANDLING VIOLATION: {violation}")
                return False
            
            if trace.success and trace.error:
                violation = f"Task {trace.task_id} succeeded but has error: {trace.error}"
                self.state_violations.append(violation)
                log.warning(f"ERROR HANDLING WARNING: {violation}")
        
        return True
    
    def validate_all(self, expected_results: Optional[dict[str, Any]] = None) -> tuple[bool, dict[str, Any]]:
        """Run all validations and return comprehensive report.
        
        Returns:
            (all_valid, report) tuple
        """
        results = {
            "stage_ordering": self.validate_stage_ordering(),
            "independence_matrix": self.validate_independence_matrix(),
            "error_handling": self.validate_error_handling(),
        }
        
        if expected_results:
            results["state_consistency"] = self.validate_state_consistency(expected_results)
        
        report = {
            "validations": results,
            "all_valid": all(results.values()),
            "violations": {
                "ordering": self.ordering_violations,
                "independence": self.independence_violations,
                "state": self.state_violations,
            },
            "execution_summary": {
                "total_tasks": len(self.traces),
                "successful": sum(1 for t in self.traces if t.success),
                "failed": sum(1 for t in self.traces if not t.success),
                "stages": len(set(t.stage_index for t in self.traces)),
            },
        }
        
        return report["all_valid"], report
    
    def get_execution_timeline(self) -> str:
        """Generate visual timeline of execution."""
        if not self.traces:
            return "No execution traces recorded"
        
        lines = ["Execution Timeline:", "=" * 60]
        
        # Sort by start time
        sorted_traces = sorted(self.traces, key=lambda t: t.start_time)
        
        for trace in sorted_traces:
            duration = (trace.end_time - trace.start_time) if trace.end_time else 0
            status = "✓" if trace.success else "✗"
            parallel_info = f" || {', '.join(trace.parallel_with)}" if trace.parallel_with else ""
            
            lines.append(
                f"[Stage {trace.stage_index}] {status} {trace.task_id} ({trace.tool_name}) "
                f"| {duration:.3f}s{parallel_info}"
            )
        
        return "\n".join(lines)


def create_validator() -> ExecutionValidator:
    """Factory function to create a new validator."""
    return ExecutionValidator()


__all__ = ["ExecutionValidator", "ExecutionTrace", "create_validator"]
