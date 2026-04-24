---
title: "Getting started"
slug: "getting-started"
order: 1
summary: "Install parlok, write your first policy, ship."
---

## Install

The Python SDK is what ships today. A TypeScript SDK is on the roadmap.

```bash
pip install parlok
```

If you need the Slack adapter or the human-in-the-loop webhook app:

```bash
pip install "parlok[slack,hitl]"
```

## Your first policy

From your project root, scaffold a starter file:

```bash
parlok init           # writes parlok.yaml
parlok lint           # validates it
parlok test           # dry-runs a few sample calls against it
```

Edit `parlok.yaml` to describe the calls you want to govern:

```yaml
version: 1
allowed_domains: [acme.com]

policies:
  - name: redact-outbound
    match:
      adapter: [slack, email]
    decision: rewrite
    transforms: [redact_pii, redact_secrets, clamp_length(2000)]

  - name: approve-external
    match:
      adapter: [slack, email]
    when: recipient.is_external
    decision: approve
    via: slack_card

  - name: allow-internal
    match:
      adapter: [slack, email]
    decision: allow
```

Three policies: scrub PII and secrets from every outbound message; park external messages for human review; otherwise allow. First match wins.

## Wrap your adapter

```python
import os
from parlok import Firewall
from parlok.adapters.slack import SlackAdapter

fw = Firewall.from_file("parlok.yaml")
slack = fw.wrap(SlackAdapter(token=os.environ["SLACK_BOT_TOKEN"]))

await slack.chat_postMessage(channel="#eng", text="deploy finished")
# → policy-checked; leaked tokens and PII are scrubbed before sending
```

The wrapped adapter forwards to the underlying SDK. Your agent code doesn't change; the proxy is invisible.

## What's next

- [Rules](/docs/reference/rules) — the YAML schema and the `when:` expression language.
- [Adapters](/docs/reference/adapters) — the built-in Slack adapter and how to write your own.
- [Decisions](/docs/reference/decisions) — allow, rewrite, approve, deny.
