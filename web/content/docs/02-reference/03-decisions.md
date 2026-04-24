---
title: "Decisions"
slug: "decisions"
order: 4
summary: "The four outcomes a policy can produce: allow, rewrite, approve, deny."
---

Every call that reaches parlok is assigned exactly one decision. Four kinds.

## Allow

The call proceeds unchanged. An audit entry is written and, for adapters with a recipient field, the recipient is recorded for `recipient.is_first_time` tracking.

```yaml
- name: internal-eng-channels
  match:
    adapter: slack
    action: chat_postMessage
  when: recipient in ["#eng", "#eng-standup", "#eng-test"]
  decision: allow
```

## Rewrite

Parlok applies a list of transforms to the `ToolCall` in order, then the adapter sends the mutated call.

```yaml
- name: redact-outbound
  match:
    adapter: [slack, email]
  decision: rewrite
  transforms: [redact_pii, redact_secrets, clamp_length(2000)]
```

Built-in transforms:

| Transform | What it does |
|---|---|
| `redact_pii` | Replaces emails, phone numbers, and SSNs in the body with `[redacted]`. |
| `redact_secrets` | Scrubs AWS access keys, GitHub tokens, Slack tokens, Stripe keys (`sk_live_…`, `sk_test_…`), bearer tokens, and JWT-shaped strings. |
| `clamp_length(n)` | Truncates the body to `n` characters. |
| `strip_urls` | Removes `https?://…` URLs from the body. |
| `tone_check` | Lowercases ALLCAPS runs and masks a small profanity list. |
| `enforce_template(regex)` | Asserts the body matches a regex; raises `RewriteFailed` if not (caller downgrades to deny). |

Transforms run left-to-right. Writing a new one is a pure function `(ToolCall, **params) → ToolCall` added to `parlok/policy/transforms.py`.

## Approve

The call is parked until a human resolves it. Parlok hands the call to the named approver; the approver returns `approved`, `denied`, or `timeout`.

```yaml
- name: approve-high-value-refund
  match:
    adapter: stripe
    action: refunds_create
  when: metadata.amount > 10000
  decision: approve
  via: slack_card
  reason: "High-value refund"
```

The `via:` value is the name of an approver you registered on the firewall:

```python
from parlok.hitl.slack_card import SlackApproverCard

fw.register_approver(
    SlackApproverCard(client=slack_web_client, channel="#approvals", store=fw._state)
)
```

Built-in approvers (v0.1):

- `SlackApproverCard` — posts a Block Kit card with Approve/Deny buttons.
- `WebhookApprover` — POSTs the call to a configured URL and waits for a callback.

Pending approvals are persisted to SQLite. If the approver times out (default: 24 hours), the call is auto-denied. If your process restarts while an approval is pending, the SQLite row survives — but the in-memory future doesn't, so the pending row becomes orphaned; recover it manually. Single-process HITL is a known v0.1 limitation.

## Deny

The call is refused. `parlok.errors.ParlokDenied(reason)` is raised from the wrapped adapter.

```yaml
- name: block-prod-drops
  match:
    adapter: postgres
    action: execute
  when: body.matches("(?i)\\bdrop\\s+table\\b")
  decision: deny
  reason: "Destructive schema change blocked."
```

Denies are loud by design. If an agent routinely trips one, that's either a policy that's too broad or an agent that needs more tools disabled.

## The default

A call that matches **no** policy is denied with `reason="no policy matched"`. Parlok fails closed; if you want permissive behaviour, add an explicit `allow` policy at the end of the file.
