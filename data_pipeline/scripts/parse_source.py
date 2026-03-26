from __future__ import annotations

import re
from pathlib import Path
from typing import Iterator

import pandas as pd


SOURCE_COLUMNS = [
    "brand_names",
    "generic_names",
    "manufacturer",
    "product_type",
    "substances",
    "indications",
    "dosage",
    "warnings",
    "drug_interactions",
    "contraindications",
]

ARRAY_COLUMNS = {"brand_names", "generic_names", "substances"}


def _unquote_sql_string(token: str) -> str:
    token = token.strip()
    if token.startswith("E'") and token.endswith("'"):
        token = token[2:-1]
        return bytes(token, "utf-8").decode("unicode_escape")
    if token.startswith("'") and token.endswith("'"):
        token = token[1:-1]
        return token.replace("''", "'")
    return token


def _split_top_level(text: str, sep: str = ",") -> list[str]:
    parts: list[str] = []
    cur: list[str] = []
    in_quote = False
    bracket_depth = 0
    brace_depth = 0
    i = 0

    while i < len(text):
        ch = text[i]
        if ch == "'":
            cur.append(ch)
            if in_quote and i + 1 < len(text) and text[i + 1] == "'":
                cur.append(text[i + 1])
                i += 2
                continue
            in_quote = not in_quote
            i += 1
            continue

        if not in_quote:
            if ch == "[":
                bracket_depth += 1
            elif ch == "]":
                bracket_depth = max(0, bracket_depth - 1)
            elif ch == "{":
                brace_depth += 1
            elif ch == "}":
                brace_depth = max(0, brace_depth - 1)
            elif ch == sep and bracket_depth == 0 and brace_depth == 0:
                parts.append("".join(cur).strip())
                cur = []
                i += 1
                continue

        cur.append(ch)
        i += 1

    if cur:
        parts.append("".join(cur).strip())
    return parts


def _parse_pg_array_literal(raw: str) -> list[str]:
    if raw == "{}" or raw.strip() == "":
        return []
    inner = raw[1:-1] if raw.startswith("{") and raw.endswith("}") else raw
    if not inner:
        return []

    parts: list[str] = []
    cur: list[str] = []
    in_quotes = False
    escape = False

    for ch in inner:
        if escape:
            cur.append(ch)
            escape = False
            continue
        if ch == "\\":
            escape = True
            continue
        if ch == '"':
            in_quotes = not in_quotes
            continue
        if ch == "," and not in_quotes:
            parts.append("".join(cur))
            cur = []
            continue
        cur.append(ch)

    if cur:
        parts.append("".join(cur))

    return [p.strip() for p in parts if p is not None]


def _parse_value(token: str):
    token = token.strip()
    if not token or token.upper() == "NULL":
        return None

    cast_idx = token.find("::")
    base = token if cast_idx == -1 else token[:cast_idx]
    base = base.strip()

    if base.startswith("ARRAY[") and base.endswith("]"):
        items_raw = base[len("ARRAY[") : -1]
        items = _split_top_level(items_raw)
        return [_unquote_sql_string(x) for x in items if x and x.upper() != "NULL"]

    if (base.startswith("'") or base.startswith("E'")) and "{" in base and "}" in base:
        maybe = _unquote_sql_string(base)
        if maybe.startswith("{") and maybe.endswith("}"):
            return _parse_pg_array_literal(maybe)

    if base.startswith("'") or base.startswith("E'"):
        return _unquote_sql_string(base)

    if re.fullmatch(r"-?\d+", base):
        return int(base)
    if re.fullmatch(r"-?\d+\.\d+", base):
        return float(base)
    return base


def _iter_insert_statements(sql_path: Path) -> Iterator[str]:
    targets = (
        "insert into drug_labels values",
        "insert into public.drug_labels values",
    )
    in_stmt = False
    buffer: list[str] = []

    with sql_path.open("r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            lower = line.lower()
            if not in_stmt and any(t in lower for t in targets):
                in_stmt = True
                buffer = [line]
                if ";" in line:
                    yield "".join(buffer)
                    in_stmt = False
                    buffer = []
                continue

            if in_stmt:
                buffer.append(line)
                if ";" in line:
                    yield "".join(buffer)
                    in_stmt = False
                    buffer = []


def _extract_value_tuples(statement: str) -> list[str]:
    idx = statement.lower().find("values")
    if idx == -1:
        return []
    values_part = statement[idx + len("values") :].strip().rstrip(";")

    tuples: list[str] = []
    depth = 0
    in_quote = False
    start = -1
    i = 0

    while i < len(values_part):
        ch = values_part[i]
        if ch == "'":
            if in_quote and i + 1 < len(values_part) and values_part[i + 1] == "'":
                i += 2
                continue
            in_quote = not in_quote
            i += 1
            continue

        if not in_quote:
            if ch == "(":
                if depth == 0:
                    start = i
                depth += 1
            elif ch == ")":
                depth -= 1
                if depth == 0 and start != -1:
                    tuples.append(values_part[start + 1 : i])
                    start = -1
        i += 1

    return tuples


def _parse_row(tuple_text: str) -> dict | None:
    fields = _split_top_level(tuple_text)
    values = [_parse_value(x) for x in fields]

    # Source dump may include id as first column.
    if len(values) == 11:
        values = values[1:]

    if len(values) != len(SOURCE_COLUMNS):
        return None
    return dict(zip(SOURCE_COLUMNS, values))


def _decode_copy_text(token: str) -> str:
    return (
        token.replace(r"\\", "\\")
        .replace(r"\t", "\t")
        .replace(r"\n", "\n")
        .replace(r"\r", "\r")
    )


def _parse_copy_value(col: str, token: str):
    if token == r"\N":
        return [] if col in ARRAY_COLUMNS else None

    text = _decode_copy_text(token)
    if col in ARRAY_COLUMNS:
        return _parse_pg_array_literal(text)
    return text


def _iter_copy_rows(sql_path: Path) -> Iterator[dict]:
    copy_re = re.compile(
        r"^COPY\s+public\.drug_labels\s*\((.+)\)\s+FROM\s+stdin;",
        re.IGNORECASE,
    )
    in_copy = False
    copy_cols: list[str] = []

    with sql_path.open("r", encoding="utf-8", errors="ignore") as f:
        for raw_line in f:
            line = raw_line.rstrip("\n")

            if not in_copy:
                m = copy_re.match(line)
                if not m:
                    continue
                copy_cols = [c.strip() for c in m.group(1).split(",")]
                in_copy = True
                continue

            if line == r"\.":
                in_copy = False
                copy_cols = []
                continue

            fields = line.split("\t")
            if len(fields) != len(copy_cols):
                continue

            raw = dict(zip(copy_cols, fields))
            row: dict = {}
            for col in SOURCE_COLUMNS:
                token = raw.get(col, r"\N")
                row[col] = _parse_copy_value(col, token)
            yield row


def build_source_dataframe(sql_path: Path) -> pd.DataFrame:
    rows: list[dict] = []

    # Prefer COPY parsing for pg_dump-style files.
    for row in _iter_copy_rows(sql_path):
        rows.append(row)

    if rows:
        return pd.DataFrame(rows, columns=SOURCE_COLUMNS)

    # Fallback for INSERT-based dumps.
    for stmt in _iter_insert_statements(sql_path):
        for tup in _extract_value_tuples(stmt):
            row = _parse_row(tup)
            if row is not None:
                rows.append(row)

    if not rows:
        return pd.DataFrame(columns=SOURCE_COLUMNS)
    return pd.DataFrame(rows, columns=SOURCE_COLUMNS)
