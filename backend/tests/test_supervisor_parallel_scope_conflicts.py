import os

os.environ.setdefault("GOOGLE_API_KEY", "test-key")

from backend.orchestration.supervisor_routing import ToolTask, build_parallel_stages, can_run_in_parallel


async def _noop_runner():
    return {"ok": True}


def test_same_patient_same_thread_match_book_blocked():
    match_task = ToolTask(
        task_id="match",
        tool_name="search_doctors_for_need",
        user_id="actor-1",
        is_write=False,
        runner=_noop_runner,
        patient_user_id="patient-1",
        thread_id="thread-1",
    )
    book_task = ToolTask(
        task_id="book",
        tool_name="book_appointment",
        user_id="actor-1",
        is_write=True,
        runner=_noop_runner,
        patient_user_id="patient-1",
        thread_id="thread-1",
    )

    assert can_run_in_parallel(match_task, book_task) is False


def test_parallel_stages_separate_same_patient_thread_match_book():
    tasks = [
        ToolTask(
            task_id="match",
            tool_name="search_doctors_for_need",
            user_id="actor-1",
            is_write=False,
            runner=_noop_runner,
            patient_user_id="patient-1",
            thread_id="thread-1",
        ),
        ToolTask(
            task_id="book",
            tool_name="book_appointment",
            user_id="actor-1",
            is_write=True,
            runner=_noop_runner,
            patient_user_id="patient-1",
            thread_id="thread-1",
        ),
    ]

    stages = build_parallel_stages(tasks)
    assert len(stages) == 2
    assert [t.task_id for t in stages[0].tasks] == ["match"]
    assert [t.task_id for t in stages[1].tasks] == ["book"]


def test_existing_matrix_rule_still_blocks_memory_conflict():
    add_task = ToolTask(
        task_id="add",
        tool_name="add_facts",
        user_id="user-1",
        is_write=True,
        runner=_noop_runner,
    )
    recall_task = ToolTask(
        task_id="recall",
        tool_name="recall_memory",
        user_id="user-1",
        is_write=False,
        runner=_noop_runner,
    )

    assert can_run_in_parallel(add_task, recall_task) is False
