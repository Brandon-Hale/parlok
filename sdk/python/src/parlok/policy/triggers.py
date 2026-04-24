"""Approve-trigger helpers callable from ``when:`` expressions."""
from __future__ import annotations

import datetime as dt
import re

from ..toolcall import ToolCall

_MONEY_RE = re.compile(r"(?:\$|£|€|USD|EUR|GBP)\s?\d[\d,\.]*", re.IGNORECASE)


def contains_keywords(call: ToolCall, keywords: list[str]) -> bool:
    if not call.body:
        return False
    low = call.body.lower()
    return any(k.lower() in low for k in keywords)


def financial_mention(call: ToolCall) -> bool:
    if call.metadata.get("amount") is not None:
        return True
    if call.body and _MONEY_RE.search(call.body):
        return True
    return False


def bulk_send(call: ToolCall, threshold: int) -> bool:
    return len(call.metadata.get("recipients") or []) > threshold


def after_hours(tz: str, start: int, end: int, *, now: dt.datetime | None = None) -> bool:
    now = now or dt.datetime.utcnow()
    # tz parameter reserved for future zoneinfo support; UTC-only in v0.1.
    hour = now.hour
    return not (start <= hour < end)
