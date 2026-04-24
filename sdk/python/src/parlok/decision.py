from dataclasses import dataclass, field
from typing import Any, Literal

DecisionKind = Literal["allow", "rewrite", "approve", "deny"]


@dataclass
class Decision:
    """The outcome of evaluating a ToolCall against the policy set.

    One of four kinds: allow (let it through), rewrite (mutate args before
    sending), approve (block until a human confirms), deny (refuse the call).
    """

    kind: DecisionKind
    reason: str | None = None
    payload: dict[str, Any] = field(default_factory=dict)

    def apply_rewrite(self, call):
        raise NotImplementedError("Rewrite transforms land in v0.1")
