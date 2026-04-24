---
title: "Introduction"
slug: "introduction"
order: 0
summary: "What parlok is and the problem it solves."
---

Parlok is a firewall for agent tool calls. It sits between your agent and the tools it calls — Slack adapters, database clients, payment APIs, whatever — and evaluates every call against a small set of YAML rules before that call is allowed to reach the tool.

## The problem

Agents write code, not judgment. Left to their own devices, they will:

- Post the wrong message to the wrong Slack channel.
- Issue a `DROP TABLE` because a tool description said "clean up".
- Refund a hallucinated charge.
- Echo an API key back to a customer.

These are the kinds of failures you don't find out about in staging. You find out at 3am, in an incident channel.

## The idea

Every tool call flows through parlok before it hits the tool. A rule either **allows** it, **rewrites** it, parks it for **approval**, or **denies** it. Your agent code keeps running; your ops and security people keep the keys to the rule file.

```yaml
match:
  adapter: postgres
  args.sql: "*DROP*"
  args.env: prod
decision: deny
reason: "schema drops forbidden in prod"
```

No new infrastructure. No bespoke policy language. Rules check into git, get reviewed in PRs, and live next to your application code.
