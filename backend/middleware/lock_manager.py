"""Centralized lock ordering helper for deadlock-safe multi-lock sections."""
from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager, contextmanager
from threading import RLock
from typing import AsyncIterator, Iterator


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
        self._thread_lock_index_guard = RLock()
        self._thread_locks: dict[str, asyncio.Lock] = {}

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

    @asynccontextmanager
    async def acquire_thread(self, thread_id: str, timeout: float = 5.0) -> AsyncIterator[None]:
        """Acquire an async lock keyed by thread_id for exclusive workflow mutation."""
        normalized = str(thread_id or "").strip()
        if not normalized:
            raise ValueError("thread_id is required for thread lock acquisition")

        with self._thread_lock_index_guard:
            lock = self._thread_locks.get(normalized)
            if lock is None:
                lock = asyncio.Lock()
                self._thread_locks[normalized] = lock

        try:
            await asyncio.wait_for(lock.acquire(), timeout=timeout)
        except asyncio.TimeoutError as exc:
            raise TimeoutError(f"Timed out acquiring thread lock for thread_id={normalized}") from exc

        try:
            yield
        finally:
            if lock.locked():
                lock.release()


lock_manager = LockManager()


__all__ = ["LockManager", "lock_manager"]
