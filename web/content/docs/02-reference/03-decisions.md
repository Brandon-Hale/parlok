---
title: "Decisions"
slug: "decisions"
order: 4
summary: "The four outcomes a rule can produce: allow, rewrite, approve, deny."
---

Every call that reaches parlok is assigned exactly one decision. Four kinds.

## Allow

The call proceeds unchanged. An audit entry is written.

```yaml
match:
  adapter: slack
  args.channel: "#eng-standup"
decision: allow
```

Allow is also the default for any call that doesn't match any rule.

## Rewrite

Parlok mutates the call arguments in place, then executes the modified call.

```yaml
match:
  adapter: slack
  args.channel: "#announce-*"
decision: rewrite
rewrite:
  args.channel: "#eng-test"
```

Rewrite is how you fix sloppy agent behaviour without surfacing an error. Useful for:

- Redirecting messages to safe channels.
- Redacting secrets from outbound text.
- Capping amounts or rate limits.

The rewrite block uses the same dotted-path notation as `match` (`args.channel`, `args.text`, `metadata.<key>`).

## Approve

The call is parked. Reviewers are notified via whatever approval backend is configured (stdout, Slack, a queue). When a reviewer approves, the call resumes with its original arguments; if they reject, `parlok.Denied` is raised.

```yaml
match:
  adapter: stripe.refunds
  args.amount: ">= 10000"
decision: approve
approve:
  reviewers: [brandon]
  timeout: 24h
```

A parked call is durable — the firewall survives process restarts.

## Deny

The call is refused. `parlok.Denied(reason)` is raised from the wrapped adapter.

```yaml
match:
  adapter: postgres
  args.sql: "*DROP*"
  args.env: prod
decision: deny
reason: "schema drops forbidden in prod"
```

Denies are loud by design. If an agent routinely trips one, that's either a rule that's too broad or an agent that needs more tools disabled.
