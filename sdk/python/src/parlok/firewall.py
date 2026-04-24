from __future__ import annotations

from pathlib import Path

from .adapter import Adapter
from ._proxy import WrappedAdapter
from .audit import AuditLog
from .decision import Decision
from .errors import ParlokDenied
from .policy.engine import evaluate as _eval
from .policy.loader import PolicySet, load_file
from .state import StateStore
from .toolcall import ToolCall


class Firewall:
    """Orchestrator: loads policies, evaluates each ToolCall, wraps adapters."""

    def __init__(self, config: dict | None = None, *, policies: PolicySet | None = None):
        self._config = config or {}
        self._policies = policies
        self._state: StateStore | None = None
        self._audit: AuditLog | None = None
        self._approvers: dict = {}
        if policies is not None:
            self._state = StateStore(policies.state_db)
            self._audit = AuditLog(policies.state_db)

    @classmethod
    def from_file(cls, path: str | Path) -> "Firewall":
        ps = load_file(path)
        return cls(policies=ps)

    def register_approver(self, approver) -> None:
        self._approvers[approver.name] = approver

    def wrap(self, adapter: Adapter) -> Adapter:
        return WrappedAdapter(adapter, self)  # type: ignore[return-value]

    def _evaluate(self, call: ToolCall) -> Decision:
        if self._policies is None:
            d = Decision(kind="deny", reason="no policies loaded")
        else:
            d = _eval(call, self._policies, state=self._state)
        if self._audit is not None:
            self._audit.write(call, d)
        if (
            self._state is not None
            and d.kind == "allow"
            and call.recipient is not None
        ):
            self._state.record_recipient(call.adapter, call.recipient)
        return d

    async def _dispatch(self, adapter: Adapter, call: ToolCall):
        decision = self._evaluate(call)
        if decision.kind == "approve":
            approver_name = (decision.payload or {}).get("via")
            approver = self._approvers.get(approver_name) if approver_name else None
            if approver is None:
                raise ParlokDenied(f"no approver registered for '{approver_name}'")
            result = await approver.request(call, decision.reason or approver_name)
            if result.kind == "approved":
                decision = Decision(
                    kind="allow",
                    reason="human-approved",
                    payload={
                        "reviewer": result.reviewer,
                        "policy": (decision.payload or {}).get("policy"),
                    },
                )
                if self._audit is not None:
                    self._audit.write(call, decision)
                if self._state is not None and call.recipient is not None:
                    self._state.record_recipient(call.adapter, call.recipient)
            elif result.kind == "denied":
                raise ParlokDenied(result.reason or "denied by reviewer")
            else:
                raise ParlokDenied("approval timeout")
        return await adapter.execute(call, decision)
