from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Literal

from ..toolcall import ToolCall


@dataclass
class ApprovalResult:
    kind: Literal["approved", "denied", "timeout"]
    reviewer: str | None = None
    reason: str | None = None


class Approver(ABC):
    name: str = "approver"

    @abstractmethod
    async def request(self, call: ToolCall, policy_reason: str) -> ApprovalResult: ...
