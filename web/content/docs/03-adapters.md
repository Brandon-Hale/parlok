---
title: "Adapters"
slug: "adapters"
order: 3
summary: "Built-in adapters and writing your own."
---

Adapters are the boundary between parlok and the SDKs your agent uses. They translate an SDK call into parlok's `ToolCall` envelope on the way in, and execute a decision on the way out.

## Built-in

Parlok ships with adapters for common integrations:

- `parlok.adapters.slack.SlackAdapter`
- `parlok.adapters.postgres.PostgresAdapter`
- `parlok.adapters.stripe.StripeAdapter`
- `parlok.adapters.http.HttpAdapter`

Usage is always the same:

```python
from parlok import Firewall
from parlok.adapters.slack import SlackAdapter

fw = Firewall.from_file("parlok.yaml")
slack = fw.wrap(SlackAdapter(token=SLACK_TOKEN))
```

The object returned by `fw.wrap` exposes the same public methods as the underlying SDK, policy-checked.

## Writing your own

Two methods: `normalise` and `execute`.

```python
from parlok import Adapter, ToolCall

class MyToolAdapter(Adapter):
    name = "mytool"

    def normalise(self, action: str, args: dict) -> ToolCall:
        return ToolCall(
            adapter=self.name,
            action=action,
            args=args,
        )

    def execute(self, call: ToolCall):
        return self.sdk.call(call.action, **call.args)
```

`normalise` turns an SDK call shape into the firewall's canonical `ToolCall`. `execute` enacts whatever the firewall decided — sending the call (Allow), sending it modified (Rewrite), parking it (Approve), or refusing it (Deny).

## Conventions

- `name` should be short, kebab-friendly, and unique across your adapters. It's how rules refer to you.
- `action` names should match the underlying SDK's method name where it makes sense (`chat_postMessage`, `execute`).
- Prefer passing the adapter an already-constructed SDK client rather than re-implementing auth.
