---
title: "Rules"
slug: "rules"
order: 2
summary: "The YAML schema for parlok policies."
---

Policies live in `parlok.yaml`. The file has three top-level fields most rules care about:

```yaml
version: 1                       # must be 1
allowed_domains: [acme.com]      # optional; powers recipient.is_external
vip_recipients: [ceo@acme.com]   # optional; powers recipient.is_vip
policies:
  - name: ...
    match: { ... }
    when: "..."
    decision: ...
```

Every policy has these fields:

```yaml
- name: redact-outbound           # unique, required
  match:                          # cheap pre-filter (optional)
    adapter: [slack, email]       # str or list; missing = wildcard
    action: send                  # str or list; missing = wildcard
  when: recipient.is_external     # expression (optional)
  decision: rewrite               # allow | rewrite | approve | deny
  transforms: [redact_pii]        # required iff decision: rewrite
  via: slack_card                 # required iff decision: approve
  reason: "External message"      # optional; shows up in the audit log
```

## Match

`match:` is the cheap pre-filter. Two keys:

- `adapter` — the adapter name (e.g. `slack`, `postgres`). String or list; missing = wildcard.
- `action` — the normalised action name (e.g. `chat_postMessage`, `execute`). String or list; missing = wildcard.

If you need to condition on anything else (recipient domain, message body, metadata values, time of day), use `when:` instead.

## When

`when:` is a small, safe expression language — not `eval`. It's given the `ToolCall` as context and returns truthy/falsy.

**Fields you can read:**

| Expression | Meaning |
|---|---|
| `adapter`, `action`, `subject` | The string fields on the call |
| `recipient.is_external` | Recipient's email domain is not in `allowed_domains` |
| `recipient.is_vip` | Recipient is in `vip_recipients` |
| `recipient.is_first_time` | No prior `allow` decision for this recipient (persisted) |
| `body.length` | Character length of the body |
| `metadata.<key>` | Any field the adapter attached |

**Operators:** `== != < <= > >=`, `and`, `or`, `not`, `in`, parentheses, string regex via `body.matches("...")`.

**Functions** (approve triggers, callable from inside `when:`):

| Function | What it means |
|---|---|
| `contains_keywords([...])` | Any of these (case-insensitive) appears in `body` |
| `financial_mention()` | Currency/amount regex in `body`, or `metadata.amount` present |
| `after_hours(tz, start, end)` | Wall clock is outside `start`–`end` hours (UTC-only in v0.1) |
| `bulk_send(n)` | `len(metadata.recipients) > n` |

Example:

```yaml
- name: after-hours-budget-talk
  match: { adapter: [slack, email] }
  when: after_hours("UTC", 9, 17)
        and contains_keywords(["budget", "forecast"])
        and recipient.is_external
  decision: approve
  via: slack_card
```

Unknown identifiers silently resolve to `None` (falsy). That means `metadata.amount > 1000` won't crash when `amount` is missing — it just evaluates false.

## Decision

Four kinds. See [Decisions](/docs/reference/decisions) for the full semantics.

| Decision | Required extra key | What it does |
|---|---|---|
| `allow` | — | Send unchanged. |
| `rewrite` | `transforms: [...]` | Run each transform left-to-right, then send. |
| `approve` | `via: <approver_name>` | Block until the named approver resolves. |
| `deny` | — (optional `reason:`) | Raise `parlok.errors.ParlokDenied`. |

## Rule order and the default

Policies are evaluated top-to-bottom. **The first matching policy wins.**

A call that matches no policy is **denied** with `reason="no policy matched"`. This is the fail-closed default; if you want permissive behaviour, write an explicit `allow` policy at the end.
