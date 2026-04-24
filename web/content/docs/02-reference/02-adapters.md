---
title: "Adapters"
slug: "adapters"
order: 3
summary: "Built-in adapters and writing your own."
---

Adapters are the boundary between parlok and the SDKs your agent uses. They translate an SDK call into parlok's `ToolCall` envelope on the way in, and execute a decision on the way out.

## Built-in

v0.1 ships with one adapter:

- `parlok.adapters.slack.SlackAdapter` — wraps `slack_sdk.WebClient.chat_postMessage`. Other `WebClient` methods pass through untouched.

Additional adapters (Postgres, Stripe, generic HTTP) are on the roadmap. Writing one is ~30 lines — see below.

Usage:

```python
import os
from parlok import Firewall
from parlok.adapters.slack import SlackAdapter

fw = Firewall.from_file("parlok.yaml")
slack = fw.wrap(SlackAdapter(token=os.environ["SLACK_BOT_TOKEN"]))

await slack.chat_postMessage(channel="#eng", text="deploy finished")
```

The object returned by `fw.wrap` forwards method calls to the underlying SDK with policy enforcement in front. Your agent code doesn't need to know parlok is there.

Install the Slack dependency as an extra:

```bash
pip install "parlok[slack]"
```

## Writing your own

Implement two methods.

```python
from parlok import Adapter, ToolCall
from parlok.decision import Decision
from parlok.errors import ParlokDenied


class MyToolAdapter(Adapter):
    name = "mytool"

    def __init__(self, client):
        self._client = client

    def normalise(self, method: str, kwargs: dict) -> ToolCall:
        return ToolCall(
            adapter=self.name,
            action=method,
            recipient=kwargs.get("to"),
            body=kwargs.get("text"),
            metadata=kwargs,
        )

    async def execute(self, call: ToolCall, decision: Decision):
        if decision.kind == "deny":
            raise ParlokDenied(decision.reason or "denied")
        if decision.kind == "rewrite":
            call = decision.apply_rewrite(call)
        return self._client.send(to=call.recipient, text=call.body)
```

- `normalise(method, kwargs)` shapes the SDK's native call into a `ToolCall`. Pack anything extra into `metadata`.
- `execute(call, decision)` enacts whatever the firewall decided. Four branches: allow (send), rewrite (apply transforms, then send), approve (reaches `execute` already resolved by the firewall — send), deny (raise `ParlokDenied`).

`ToolCall` fields: `adapter`, `action`, `recipient`, `body`, `subject`, `metadata`. No arbitrary `args` field — put anything custom in `metadata`, and write policies against `metadata.<key>`.

## Conventions

- `name` should be short and unique across your adapters. Policies refer to it via `match.adapter`.
- `action` names should match the underlying SDK's method name (`chat_postMessage`, `execute`, `refunds_create`).
- Prefer passing the adapter an already-constructed SDK client rather than re-implementing auth. Most built-ins also accept a `token=` kwarg and fall back to environment variables.
