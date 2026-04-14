#!/usr/bin/env python3
"""Apply deterministic SQL migrations and enforce required booking indexes.

This lightweight runner executes phase migrations from the repository `database`
folder, tracks applied files with checksums, and verifies critical indexes that
protect slot uniqueness and booking read paths.
"""
from __future__ import annotations

import argparse
import hashlib
import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import Engine, create_engine, text

MIGRATION_FILE_PATTERN = re.compile(r"^phase(\d+)_.*\.sql$")

REQUIRED_INDEXES: dict[str, str] = {
    "idx_usr_doctor_specialty_status_active": "usr",
    "idx_time_slot_doctor_start_available": "time_slot",
    "uq_appointment_active_slot": "appointment",
    "idx_appointment_patient_doctor_active": "appointment",
}


@dataclass(frozen=True)
class MigrationFile:
    phase: int
    name: str
    path: Path


def load_environment() -> None:
    """Load environment variables from common local paths."""
    repo_root = Path(__file__).resolve().parents[2]
    load_dotenv(repo_root / ".env")
    load_dotenv(repo_root / "backend" / ".env")


def build_database_url() -> str:
    """Build DB URL from DATABASE_URL or DB_* variables."""
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return database_url

    host = os.getenv("DB_HOST")
    port = os.getenv("DB_PORT")
    db_name = os.getenv("DB_NAME")
    user = os.getenv("DB_USER")
    password = os.getenv("DB_PASSWORD")

    missing = [
        key
        for key, value in {
            "DB_HOST": host,
            "DB_PORT": port,
            "DB_NAME": db_name,
            "DB_USER": user,
            "DB_PASSWORD": password,
        }.items()
        if not value
    ]
    if missing:
        raise RuntimeError(f"Missing required DB settings: {', '.join(missing)}")

    return f"postgresql://{user}:{password}@{host}:{port}/{db_name}"


def discover_phase_migrations(database_dir: Path) -> list[MigrationFile]:
    """Return deterministic list of phase SQL files."""
    migrations: list[MigrationFile] = []
    for path in database_dir.iterdir():
        if not path.is_file():
            continue
        match = MIGRATION_FILE_PATTERN.match(path.name)
        if not match:
            continue
        migrations.append(MigrationFile(phase=int(match.group(1)), name=path.name, path=path))

    # Phase order first, filename tie-breaker for deterministic behavior.
    return sorted(migrations, key=lambda m: (m.phase, m.name))


def sha256_file(path: Path) -> str:
    """Compute SHA-256 checksum for migration integrity tracking."""
    digest = hashlib.sha256()
    with path.open("rb") as migration_file:
        for chunk in iter(lambda: migration_file.read(8192), b""):
            digest.update(chunk)
    return digest.hexdigest()


def normalize_sql_for_managed_transaction(sql_text: str) -> str:
    """Remove top-level BEGIN/COMMIT statements for SQLAlchemy transaction scope."""
    normalized_lines: list[str] = []
    for raw_line in sql_text.splitlines():
        line = raw_line.strip().rstrip(";").upper()
        if line in {"BEGIN", "COMMIT"}:
            continue
        normalized_lines.append(raw_line)
    return "\n".join(normalized_lines).strip()


def ensure_schema_migrations_table(engine: Engine) -> None:
    """Create migration tracking table if it does not exist."""
    create_sql = """
    CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        checksum TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
    """
    with engine.begin() as conn:
        conn.execute(text(create_sql))


def apply_phase_migrations(engine: Engine, database_dir: Path, dry_run: bool = False) -> dict[str, int]:
    """Apply phase migrations with checksum enforcement and idempotency."""
    ensure_schema_migrations_table(engine)
    migrations = discover_phase_migrations(database_dir)

    applied = 0
    skipped = 0

    for migration in migrations:
        checksum = sha256_file(migration.path)

        with engine.begin() as conn:
            existing = conn.execute(
                text("SELECT checksum FROM schema_migrations WHERE filename = :filename"),
                {"filename": migration.name},
            ).scalar_one_or_none()

            if existing:
                if existing != checksum:
                    raise RuntimeError(
                        "Checksum mismatch for already-applied migration "
                        f"{migration.name}. Create a new migration file instead of editing history."
                    )
                print(f"[migrations] skip {migration.name} (already applied)")
                skipped += 1
                continue

            if dry_run:
                print(f"[migrations] dry-run would apply {migration.name}")
                continue

            sql_text = migration.path.read_text(encoding="utf-8")
            executable_sql = normalize_sql_for_managed_transaction(sql_text)
            conn.exec_driver_sql(executable_sql)
            conn.execute(
                text(
                    "INSERT INTO schema_migrations (filename, checksum) "
                    "VALUES (:filename, :checksum)"
                ),
                {"filename": migration.name, "checksum": checksum},
            )

            print(f"[migrations] applied {migration.name}")
            applied += 1

    print(f"[migrations] summary applied={applied} skipped={skipped} dry_run={dry_run}")
    return {"applied": applied, "skipped": skipped}


def verify_required_indexes(engine: Engine) -> list[str]:
    """Return list of missing required index names."""
    with engine.begin() as conn:
        rows = conn.execute(
            text(
                """
                SELECT indexname, tablename
                FROM pg_indexes
                WHERE schemaname = 'public'
                """
            )
        ).fetchall()

    existing = {row[0]: row[1] for row in rows}
    missing: list[str] = []

    for index_name, table_name in REQUIRED_INDEXES.items():
        if existing.get(index_name) != table_name:
            missing.append(index_name)

    if missing:
        print("[indexes] missing required indexes:")
        for index_name in missing:
            print(f"[indexes] - {index_name} (table={REQUIRED_INDEXES[index_name]})")
    else:
        print("[indexes] all required safeguards present")

    return missing


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Apply DB phase migrations and verify required indexes")
    parser.add_argument(
        "--database-dir",
        default=None,
        help="Optional path to migrations directory (defaults to <repo>/database)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="List unapplied migrations without executing SQL",
    )
    parser.add_argument(
        "--check-indexes-only",
        action="store_true",
        help="Skip migration execution and only verify required index safeguards",
    )
    return parser.parse_args()


def main() -> int:
    load_environment()
    args = parse_args()

    repo_root = Path(__file__).resolve().parents[2]
    database_dir = Path(args.database_dir) if args.database_dir else repo_root / "database"

    if not database_dir.exists() or not database_dir.is_dir():
        print(f"[migrations] Database directory not found: {database_dir}")
        return 1

    try:
        engine = create_engine(build_database_url())

        if not args.check_indexes_only:
            apply_phase_migrations(engine, database_dir, dry_run=args.dry_run)

        missing = verify_required_indexes(engine)
        if missing:
            return 1

        return 0
    except Exception as exc:
        print(f"[migrations] failed: {exc}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
