from __future__ import annotations

import asyncio
from typing import Any

from ..state import StateStore
from ..toolcall import ToolCall
from .base import Approver, ApprovalResult


class SlackApproverCard(Approver):
    name = "slack_card"

    def __init__(self, *, client: Any, channel: str, store: StateStore, timeout: float = 24 * 3600):
        self._client = client
        self._channel = channel
        self._store = store
        self._timeout = timeout
        self._futures: dict[str, asyncio.Future[ApprovalResult]] = {}

    def _build_blocks(self, pid: str, call: ToolCall, reason: str) -> list[dict]:
        return [
            {"type": "section", "text": {"type": "mrkdwn",
                "text": f"*parlok* needs approval: `{reason}`"}},
            {"type": "section", "text": {"type": "mrkdwn",
                "text": f"*{call.adapter}.{call.action}* -> `{call.recipient}`\n```{call.body or ''}```"}},
            {"type": "actions", "elements": [
                {"type": "button", "action_id": f"approve:{pid}",
                 "text": {"type": "plain_text", "text": "Approve"}, "style": "primary"},
                {"type": "button", "action_id": f"deny:{pid}",
                 "text": {"type": "plain_text", "text": "Deny"}, "style": "danger"},
            ]},
        ]

    async def request(self, call: ToolCall, policy_reason: str) -> ApprovalResult:
        pid = self._store.create_pending(call.adapter, call.action, call.recipient, call.body)
        blocks = self._build_blocks(pid, call, policy_reason)
        await asyncio.get_running_loop().run_in_executor(
            None,
            lambda: self._client.chat_postMessage(
                channel=self._channel, blocks=blocks, text="parlok approval"
            ),
        )
        fut: asyncio.Future[ApprovalResult] = asyncio.get_running_loop().create_future()
        self._futures[pid] = fut
        try:
            return await asyncio.wait_for(fut, timeout=self._timeout)
        except asyncio.TimeoutError:
            self._store.resolve_pending(pid, "timeout", None, None)
            return ApprovalResult(kind="timeout")
        finally:
            self._futures.pop(pid, None)

    def resolve(self, pid: str, kind: str, reviewer: str | None, reason: str | None) -> None:
        self._store.resolve_pending(pid, kind, reviewer, reason)
        fut = self._futures.get(pid)
        if fut and not fut.done():
            fut.set_result(ApprovalResult(kind=kind, reviewer=reviewer, reason=reason))  # type: ignore[arg-type]
