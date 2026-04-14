#!/usr/bin/env python3
"""Create core ORM tables required before phase index migrations.

Used by CI against a fresh ephemeral database so phase index SQL can run on
existing base tables.
"""
from __future__ import annotations

import sys
import os
from pathlib import Path

from dotenv import load_dotenv

REPO_ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = REPO_ROOT / "backend"
sys.path.insert(0, str(BACKEND_DIR))

load_dotenv(REPO_ROOT / ".env")
load_dotenv(BACKEND_DIR / ".env")
os.environ.setdefault("SECRET_KEY", "ci-dev-secret")

from app.database import Base, engine

# Ensure model metadata is registered before create_all.
from app.models import appointment, time_slot, user  # noqa: F401


def main() -> int:
    Base.metadata.create_all(bind=engine)
    print("[bootstrap] Base ORM tables ensured")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
