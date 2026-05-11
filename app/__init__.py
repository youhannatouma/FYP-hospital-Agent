"""Compatibility package shim.

Allows imports like ``app.database`` to resolve to ``backend/app/database.py``
when tests execute from repository root.
"""

from pathlib import Path

_BACKEND_APP_DIR = Path(__file__).resolve().parent.parent / "backend" / "app"
__path__ = [str(_BACKEND_APP_DIR)]

