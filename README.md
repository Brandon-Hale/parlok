# parlok

**Guardrails for agents.** A lightweight runtime firewall that wraps agent tool calls and evaluates each one against declarative policies before it executes.

Every call is routed to one of four outcomes:

- **Allow** — let it through unchanged
- **Rewrite** — scrub PII/secrets before sending
- **Approve** — park for a human to confirm
- **Deny** — refuse with a structured reason

## Install

```bash
pip install parlok
```

Or install with the Slack adapter:

```bash
pip install "parlok[slack]"
```

Quick look:

```python
import os
from parlok import Firewall
from parlok.adapters.slack import SlackAdapter

fw = Firewall.from_file("parlok.yaml")
slack = fw.wrap(SlackAdapter(token=os.environ["SLACK_BOT_TOKEN"]))

await slack.chat_postMessage(channel="#eng", text="deploy finished")
# policy-checked; leaked tokens and PII are scrubbed before sending
```

Scaffold a starter policy file with `parlok init`, validate with `parlok lint`, preview decisions on sample calls with `parlok test`.

Full docs: [parlok.dev/docs](https://parlok.dev/docs).

## Repository layout

- `sdk/python/` — the Python SDK (shipped v0.1.0)
- `sdk/python/examples/` — runnable demo walking through every decision kind
- `web/` — the landing page + docs (Next.js)

## Status

- v0.1.0 — first usable cut. YAML policy engine, rewrite/approve/deny outcomes, Slack `chat_postMessage` adapter end-to-end, Slack Block Kit + webhook approvers, SQLite state + audit log, `parlok init/lint/test` CLI.
- TypeScript SDK and additional adapters (Postgres, Stripe, generic HTTP) are on the roadmap.

## License

MIT
