---
title: "Rules"
slug: "rules"
order: 2
summary: "The YAML schema for parlok rules."
---

Rules live in `parlok.yaml`. Each rule is a top-level list entry with three sections: `match` (which calls this applies to), `decision` (what to do about them), and an optional action block.

## Shape

```yaml
- name: safe_channels
  match:
    adapter: slack
    args.channel: "#announce-*"
  decision: rewrite
  rewrite:
    args.channel: "#eng-test"
```

`name` is optional but recommended — it's what shows up in your audit trail.

## Match

Matchers are key/value pairs over `ToolCall` fields. The supported fields are:

- `adapter` — the adapter id (e.g. `slack`, `postgres`, `stripe.refunds`).
- `action` — the normalised action name (e.g. `chat_postMessage`).
- `args.<key>` — any argument the agent passed.
- `metadata.<key>` — anything the adapter or the wrapping code attaches.

Values can be:

- An exact value — `prod`, `3`, `true`.
- A glob pattern — `"#announce-*"`, `"*DROP*"`.
- A numeric comparison — `"> 10000"`, `">= 5"`, `"< 100"`.
- A list — `[slack, email]` matches either.

All matchers must be satisfied for the rule to apply.

## Decisions

| Decision | Action block | Meaning |
| --- | --- | --- |
| `allow` | — | The call proceeds unchanged. |
| `rewrite` | `rewrite:` | The call is modified, then executed. |
| `approve` | `approve:` | The call is parked until a reviewer approves. |
| `deny` | optional `reason:` | The call is refused. `parlok.Denied` is raised. |

See [Decisions](/docs/decisions) for the full semantics.

## Rule order

Rules are evaluated top-to-bottom. The first matching rule wins. A call that matches nothing defaults to `allow`.
