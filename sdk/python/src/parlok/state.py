from __future__ import annotations

import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path

_SCHEMA = """
CREATE TABLE IF NOT EXISTS pending_approvals (
    id            TEXT PRIMARY KEY,
    adapter       TEXT NOT NULL,
    action        TEXT NOT NULL,
    recipient     TEXT,
    body          TEXT,
    created_at    TEXT NOT NULL,
    resolved_at   TEXT,
    resolution    TEXT,
    reviewer      TEXT,
    reason        TEXT
);
CREATE TABLE IF NOT EXISTS known_recipients (
    adapter       TEXT NOT NULL,
    recipient     TEXT NOT NULL,
    first_seen_at TEXT NOT NULL,
    PRIMARY KEY (adapter, recipient)
);
CREATE TABLE IF NOT EXISTS audit_log (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    ts            TEXT NOT NULL,
    adapter       TEXT NOT NULL,
    action        TEXT NOT NULL,
    recipient     TEXT,
    policy        TEXT,
    decision_kind TEXT NOT NULL,
    reason        TEXT
);
"""


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _connect(path: str | Path) -> sqlite3.Connection:
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(p, detect_types=sqlite3.PARSE_DECLTYPES)
    conn.row_factory = sqlite3.Row
    conn.executescript(_SCHEMA)
    return conn


class StateStore:
    def __init__(self, path: str | Path):
        self._path = path
        self._conn = _connect(path)

    def is_first_time(self, adapter: str, recipient: str) -> bool:
        cur = self._conn.execute(
            "SELECT 1 FROM known_recipients WHERE adapter=? AND recipient=?",
            (adapter, recipient),
        )
        return cur.fetchone() is None

    def record_recipient(self, adapter: str, recipient: str) -> None:
        self._conn.execute(
            "INSERT OR IGNORE INTO known_recipients(adapter, recipient, first_seen_at) VALUES (?, ?, ?)",
            (adapter, recipient, _now()),
        )
        self._conn.commit()

    def create_pending(self, adapter: str, action: str, recipient: str | None, body: str | None) -> str:
        pid = uuid.uuid4().hex
        self._conn.execute(
            "INSERT INTO pending_approvals(id, adapter, action, recipient, body, created_at)"
            " VALUES (?, ?, ?, ?, ?, ?)",
            (pid, adapter, action, recipient, body, _now()),
        )
        self._conn.commit()
        return pid

    def resolve_pending(self, pid: str, resolution: str, reviewer: str | None, reason: str | None) -> None:
        self._conn.execute(
            "UPDATE pending_approvals SET resolved_at=?, resolution=?, reviewer=?, reason=? WHERE id=?",
            (_now(), resolution, reviewer, reason, pid),
        )
        self._conn.commit()

    def list_pending(self) -> list[dict]:
        cur = self._conn.execute(
            "SELECT * FROM pending_approvals WHERE resolved_at IS NULL"
        )
        return [dict(r) for r in cur.fetchall()]

    def get_resolution(self, pid: str) -> dict | None:
        cur = self._conn.execute(
            "SELECT * FROM pending_approvals WHERE id=?", (pid,)
        )
        row = cur.fetchone()
        return dict(row) if row else None
