"""Evaluate a ToolCall against a PolicySet -> Decision."""
from __future__ import annotations

from typing import Any

from ..decision import Decision
from ..toolcall import ToolCall
from . import resolvers, triggers
from .expr import evaluate as eval_expr
from .loader import Policy, PolicySet


def _matches(pol: Policy, call: ToolCall) -> bool:
    ad = pol.match.get("adapter")
    if ad is not None:
        want = [ad] if isinstance(ad, str) else list(ad)
        if call.adapter not in want:
            return False
    ac = pol.match.get("action")
    if ac is not None:
        want = [ac] if isinstance(ac, str) else list(ac)
        if call.action not in want:
            return False
    return True


class _Body(str):
    @property
    def length(self) -> int:
        return len(self)


class _Recipient(str):
    def __new__(cls, value: str, *, call: ToolCall, ps: PolicySet, state):
        obj = str.__new__(cls, value)
        obj._call = call
        obj._ps = ps
        obj._state = state
        return obj

    @property
    def is_external(self) -> bool:
        return resolvers.is_external_recipient(self._call, self._ps.allowed_domains)

    @property
    def is_vip(self) -> bool:
        return resolvers.is_vip_recipient(self._call, self._ps.vip_recipients)

    @property
    def is_first_time(self) -> bool:
        if self._state is None:
            return True
        return self._state.is_first_time(self._call.adapter, self._call.recipient or "")


def _build_context(call: ToolCall, ps: PolicySet, state) -> dict[str, Any]:
    body = _Body(call.body or "")
    recipient = _Recipient(call.recipient or "", call=call, ps=ps, state=state)
    return {
        "adapter":   call.adapter,
        "action":    call.action,
        "recipient": recipient,
        "body":      body,
        "subject":   call.subject,
        "metadata":  call.metadata,
        "external_recipient":   recipient.is_external,
        "vip_recipient":        recipient.is_vip,
        "first_time_recipient": recipient.is_first_time,
    }


def _build_funcs(call: ToolCall, ps: PolicySet) -> dict[str, Any]:
    return {
        "contains_keywords":  lambda kws: triggers.contains_keywords(call, list(kws)),
        "financial_mention":  lambda: triggers.financial_mention(call),
        "after_hours":        lambda tz, s, e: triggers.after_hours(tz, s, e),
        "bulk_send":          lambda n: triggers.bulk_send(call, n),
    }


def evaluate(call: ToolCall, ps: PolicySet, *, state=None) -> Decision:
    ctx = _build_context(call, ps, state)
    funcs = _build_funcs(call, ps)
    for pol in ps.policies:
        if not _matches(pol, call):
            continue
        if pol.when_expr is not None:
            if not bool(eval_expr(pol.when_expr, ctx, funcs)):
                continue
        if pol.decision == "allow":
            return Decision(kind="allow", reason=pol.reason,
                            payload={"policy": pol.name})
        if pol.decision == "deny":
            return Decision(kind="deny", reason=pol.reason or "denied",
                            payload={"policy": pol.name})
        if pol.decision == "rewrite":
            return Decision(kind="rewrite", reason=pol.reason,
                            payload={"policy": pol.name, "transforms": pol.transforms})
        if pol.decision == "approve":
            return Decision(kind="approve", reason=pol.reason,
                            payload={"policy": pol.name, "via": pol.via})
    return Decision(kind="deny", reason="no policy matched", payload={"policy": None})
