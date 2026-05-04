#!/usr/bin/env python3
"""DB preflight check for local/CI usage.

Fails with non-zero exit code when DB env is misconfigured or unreachable.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine, text


def _load_env() -> None:
    repo_root = Path(__file__).resolve().parents[2]
    load_dotenv(repo_root / ".env")
    load_dotenv(repo_root / "backend" / ".env")


def _build_database_url() -> tuple[str | None, list[str]]:
    errors: list[str] = []
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return database_url, errors

    host = os.getenv("DB_HOST")
    port = os.getenv("DB_PORT")
    name = os.getenv("DB_NAME")
    user = os.getenv("DB_USER")
    password = os.getenv("DB_PASSWORD")

    if not host:
        errors.append("Missing DB_HOST")
    if not port:
        errors.append("Missing DB_PORT")
    if not name:
        errors.append("Missing DB_NAME")
    if not user:
        errors.append("Missing DB_USER")
    if not password:
        errors.append("Missing DB_PASSWORD")

    if port:
        try:
            int(port)
        except ValueError:
            errors.append("DB_PORT must be an integer")

    if errors:
        return None, errors

    if host in {"localhost", "127.0.0.1"} and port == "5432":
        errors.append(
            "DB_HOST=localhost with DB_PORT=5432 may be wrong for host Docker setup; use 5433 if Docker maps 5433:5432"
        )

    url = f"postgresql://{user}:{password}@{host}:{port}/{name}"
    return url, errors


def main() -> int:
    _load_env()

    url, errors = _build_database_url()
    if errors:
        for err in errors:
            print(f"[preflight] {err}")
        if url is None:
            return 1

    if not url:
        print("[preflight] Unable to build DATABASE_URL")
        return 1

    try:
        engine = create_engine(url)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            current_db = conn.execute(text("SELECT current_database()")).scalar()
        print(f"[preflight] DB connectivity OK (database={current_db})")
        return 0
    except Exception as exc:
        print(f"[preflight] DB connectivity FAILED: {exc}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
