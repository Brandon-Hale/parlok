"""Resolvers for computed ToolCall fields used in ``when:`` expressions."""
from __future__ import annotations

from ..toolcall import ToolCall


def is_external_recipient(call: ToolCall, allowed_domains: list[str]) -> bool:
    r = call.recipient or ""
    if "@" in r:
        domain = r.split("@", 1)[1].lower()
        return domain not in {d.lower() for d in allowed_domains}
    return False


def is_vip_recipient(call: ToolCall, vips: list[str]) -> bool:
    return (call.recipient or "") in set(vips)
