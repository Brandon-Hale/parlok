from __future__ import annotations

import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from .decision import Decision
from .toolcall import ToolCall

_SCHEMA = """
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


class AuditLog:
    def __init__(self, path: str | Path):
        p = Path(path)
        p.parent.mkdir(parents=True, exist_ok=True)
        self._conn = sqlite3.connect(p)
        self._conn.row_factory = sqlite3.Row
        self._conn.executescript(_SCHEMA)

    def write(self, call: ToolCall, decision: Decision) -> None:
        ts = datetime.now(timezone.utc).isoformat()
        policy = (decision.payload or {}).get("policy")
        self._conn.execute(
            "INSERT INTO audit_log(ts, adapter, action, recipient, policy, decision_kind, reason)"
            " VALUES (?, ?, ?, ?, ?, ?, ?)",
            (ts, call.adapter, call.action, call.recipient, policy, decision.kind, decision.reason),
        )
        self._conn.commit()

    def tail(self, n: int = 50) -> list[dict]:
        cur = self._conn.execute(
            "SELECT * FROM audit_log ORDER BY id DESC LIMIT ?", (n,)
        )
        return [dict(r) for r in cur.fetchall()]
