from __future__ import annotations

import asyncio
import os
from typing import Any

from ..adapter import Adapter
from ..decision import Decision
from ..errors import ParlokDenied
from ..toolcall import ToolCall

_RESERVED_META = {"_passthrough", "_orig_kwargs"}


class SlackAdapter(Adapter):
    """Wraps slack_sdk.WebClient. Only chat_postMessage is policy-intercepted."""

    name = "slack"

    def __init__(self, token: str | None = None, *, client: Any = None):
        if client is not None:
            self._client = client
            return
        if token is None:
            token = os.environ.get("SLACK_BOT_TOKEN") or os.environ.get("SLACK_TOKEN")
        if token is None:
            raise ValueError(
                "SlackAdapter needs a token (SLACK_BOT_TOKEN env var) or an injected client"
            )
        try:
            from slack_sdk import WebClient
        except ImportError as e:
            raise ImportError(
                "SlackAdapter requires slack_sdk; install with `pip install parlok[slack]`"
            ) from e
        self._client = WebClient(token=token)

    def normalise(self, method: str, kwargs: dict) -> ToolCall:
        if method != "chat_postMessage":
            return ToolCall(
                adapter=self.name, action=method,
                metadata={"_passthrough": True, **kwargs},
            )
        md = {k: v for k, v in kwargs.items() if k not in {"channel", "text"}}
        md["_orig_kwargs"] = dict(kwargs)
        return ToolCall(
            adapter=self.name,
            action=method,
            recipient=kwargs.get("channel"),
            body=kwargs.get("text"),
            metadata=md,
        )

    async def execute(self, call: ToolCall, decision: Decision):
        if decision.kind == "deny":
            raise ParlokDenied(decision.reason or "denied")
        if decision.kind == "rewrite":
            call = decision.apply_rewrite(call)
        extra = {k: v for k, v in call.metadata.items() if k not in _RESERVED_META}
        return await asyncio.get_running_loop().run_in_executor(
            None,
            lambda: self._client.chat_postMessage(
                channel=call.recipient, text=call.body, **extra
            ),
        )
