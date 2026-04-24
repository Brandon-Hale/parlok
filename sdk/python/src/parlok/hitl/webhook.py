from __future__ import annotations

import asyncio
import json
from typing import Callable
from urllib.request import Request, urlopen

from ..state import StateStore
from ..toolcall import ToolCall
from .base import Approver, ApprovalResult


def _post(url: str, payload: dict) -> None:
    data = json.dumps(payload).encode()
    req = Request(url, data=data, headers={"Content-Type": "application/json"})
    with urlopen(req, timeout=10):
        pass


class WebhookApprover(Approver):
    name = "webhook"

    def __init__(
        self,
        *,
        url: str,
        store: StateStore,
        timeout: float = 24 * 3600,
        poster: Callable[[str, dict], None] = _post,
    ):
        self._url = url
        self._store = store
        self._timeout = timeout
        self._post = poster
        self._futures: dict[str, asyncio.Future[ApprovalResult]] = {}

    async def request(self, call: ToolCall, policy_reason: str) -> ApprovalResult:
        loop = asyncio.get_running_loop()
        # Register the future BEFORE any await, so a racing resolver that sees
        # the pending row always finds a future waiting for it.
        pid = self._store.create_pending(call.adapter, call.action, call.recipient, call.body)
        fut: asyncio.Future[ApprovalResult] = loop.create_future()
        self._futures[pid] = fut

        payload = {
            "pending_id": pid, "reason": policy_reason,
            "call": {
                "adapter": call.adapter, "action": call.action,
                "recipient": call.recipient, "body": call.body,
                "metadata": call.metadata,
            },
        }
        try:
            await loop.run_in_executor(None, self._post, self._url, payload)
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
