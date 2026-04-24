# parlok demo

A self-contained walk-through of the parlok SDK. Three fake adapters (Slack,
email, Postgres), one realistic policy file, and a script that sends a handful
of tool calls through the firewall so you can watch allow / rewrite / approve
/ deny in action.

## Run it

From this directory, after `pip install -e ..` has set up the SDK:

```bash
# auto-approves every HITL prompt — scripted end-to-end
python demo.py

# asks you [y/n] at the console for each approval
python demo.py --interactive

# auto-denies every HITL prompt — useful for testing the deny path
python demo.py --deny-all
```

## What it exercises

| Scenario | Decision | Why |
|---|---|---|
| Slack message to `#eng`        | allow   | internal channel, no sensitive content |
| Slack message with a GitHub token | rewrite | `redact_secrets` wipes `ghp_*` before sending |
| Email with email address + phone | rewrite | `redact_pii` scrubs both |
| External email mentioning $50,000 | approve | `recipient.is_external and financial_mention()` |
| Email to `ceo@acme.com`          | approve | VIP list match |
| `postgres.execute("DROP TABLE users")` | deny | destructive-schema regex |
| `twilio.sms(...)` (unwired adapter) | n/a | shows fail-closed behaviour — no Twilio adapter was wrapped |

## Files

- `parlok.yaml` — the policy file (six policies covering all four decision kinds).
- `demo.py` — wires up three fake adapters and walks the scenarios.

## Tweak

Edit `parlok.yaml` to change the rules (e.g., remove `approve-vip` and watch
the VIP scenario fall through to `redact-outbound` instead). Re-run — the
demo reloads the file on every invocation.

Edit the `SCENARIOS` list in `demo.py` to add your own tool calls.
