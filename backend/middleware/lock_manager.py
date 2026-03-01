"""Centralized lock ordering helper for deadlock-safe multi-lock sections."""
from __future__ import annotations

from contextlib import contextmanager
from threading import RLock
from typing import Iterator


class LockManager:
    """Manage lock acquisition in fixed order with optional timeout.

    Order is always:
    1) session
    2) memory
    3) supervisor
    """

    def __init__(self) -> None:
        self._session_lock = RLock()
        self._memory_lock = RLock()
        self._supervisor_lock = RLock()

    @contextmanager
    def acquire_ordered(
        self,
        *,
        session: bool = False,
        memory: bool = False,
        supervisor: bool = False,
        timeout: float = 5.0,
    ) -> Iterator[None]:
        acquired: list[RLock] = []
        plan = []
        if session:
            plan.append(self._session_lock)
        if memory:
            plan.append(self._memory_lock)
        if supervisor:
            plan.append(self._supervisor_lock)

        try:
            for lock in plan:
                if not lock.acquire(timeout=timeout):
                    raise TimeoutError("Timed out acquiring ordered lock")
                acquired.append(lock)
            yield
        finally:
            for lock in reversed(acquired):
                lock.release()


lock_manager = LockManager()


__all__ = ["LockManager", "lock_manager"]
