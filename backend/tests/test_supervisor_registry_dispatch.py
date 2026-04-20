import os

import pytest

os.environ.setdefault("GOOGLE_API_KEY", "test-key")

from backend.orchestration import supervisor_workflow as swf


def test_registry_dispatch_builds_known_tool_task():
    task = swf._validate_and_build_tool_task(
        user_id="user-1",
        task_spec={"tool_name": "user_fact_count"},
        index=1,
    )

    assert task.task_id == "task_1"
    assert task.tool_name == "user_fact_count"
    assert task.user_id == "user-1"
    assert task.is_write is False


def test_registry_dispatch_rejects_unknown_tool():
    with pytest.raises(ValueError) as exc:
        swf._validate_and_build_tool_task(
            user_id="user-1",
            task_spec={"tool_name": "does_not_exist"},
            index=1,
        )

    assert "unsupported tool_name" in str(exc.value)
