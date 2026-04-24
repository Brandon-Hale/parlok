---
title: "Getting started"
slug: "getting-started"
order: 1
summary: "Install parlok, write your first rule, ship."
---

## Install

```bash
pip install parlok
```

Or, for TypeScript:

```bash
npm install parlok
```

## Your first rule

Create a `parlok.yaml` next to your app:

```yaml
match:
  adapter: slack
  args.channel: "#announce-*"
decision: rewrite
rewrite:
  args.channel: "#eng-test"
```

This single rule catches any `chat_postMessage` call to a channel starting with `#announce-` and redirects it to `#eng-test`. Good for the first week while you verify your agent isn't blasting production channels.

## Wrap your adapter

```python
from parlok import Firewall
from parlok.adapters.slack import SlackAdapter

fw = Firewall.from_file("parlok.yaml")
slack = fw.wrap(SlackAdapter(token=SLACK_TOKEN))

await slack.chat_postMessage(channel="#announce-all", text="closed a deal")
# → rewritten to #eng-test
```

The wrapped adapter has the same API surface as the underlying SDK. Your agent code doesn't change.

## What's next

- [Rules](/docs/rules) — the YAML schema.
- [Adapters](/docs/adapters) — built-in adapters and how to write your own.
- [Decisions](/docs/decisions) — allow, rewrite, approve, deny.
