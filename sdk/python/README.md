# parlok (Python SDK)

**Guardrails for agents.** A lightweight runtime firewall that wraps agent tool calls and evaluates each one against declarative policies before it executes.

> **Status:** `v0.0.1` — skeleton. Public shape is fixed; the policy engine, YAML loader, and working adapters land in `v0.1`. Everything non-trivial currently raises `NotImplementedError` with a pointer to the version it ships in.

---

## What parlok does

Agents call tools. Tools have side effects. A hallucinated argument, a wrong recipient, or a runaway loop can send a Slack blast to the wrong channel, issue a refund from a fictional ticket, or `DROP TABLE` a production database.

parlok sits between the agent and the tool SDK. Every call is normalised into a `ToolCall`, evaluated against a policy file, and routed to one of four outcomes:

| Decision | Meaning |
|----------|---------|
| **Allow**   | Let the call through unchanged. |
| **Rewrite** | Mutate arguments before sending (redact PII, clamp length, strip URLs, etc.). |
| **Approve** | Block until a human confirms (Slack approval card, webhook, etc.). |
| **Deny**    | Refuse the call; return a structured reason to the agent. |

The agent code stays the same — the wrapped adapter exposes the underlying SDK's API surface. Policy lives in a separate YAML file owned by ops/security, not in the agent prompt.

---

## Architecture (the four primitives)

The whole SDK is four small concepts. Everything else is implementation detail.

```
        ┌─────────────────────────────────────────────────────────┐
        │                       Firewall                          │
        │   loads policies, decides Allow / Rewrite / Approve /   │
        │                  Deny for each ToolCall                 │
        └─────────────────────────────────────────────────────────┘
                          ▲                       │
                          │ ToolCall              │ Decision
                          │                       ▼
        ┌─────────────────────────────────────────────────────────┐
        │                       Adapter                           │
        │   wraps one external SDK (Slack, Resend, Twilio, ...)   │
        │   - normalise(method, kwargs) -> ToolCall               │
        │   - execute(call, decision)   -> enacts the outcome     │
        └─────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                            real SDK call site
```

### `ToolCall` — the normalised envelope

Every adapter converts its native call shape into a `ToolCall` so policies can be written against one schema regardless of which SDK is wrapped.

```python
@dataclass
class ToolCall:
    adapter: str                             # "slack", "email", "postgres", ...
    action: str                              # "chat_postMessage", "send", "execute", ...
    recipient: str | None = None
    body: str | None = None
    subject: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)
```

### `Decision` — the policy outcome

```python
DecisionKind = Literal["allow", "rewrite", "approve", "deny"]

@dataclass
class Decision:
    kind: DecisionKind
    reason: str | None = None
    payload: dict[str, Any] = field(default_factory=dict)

    def apply_rewrite(self, call): ...   # NotImplementedError until v0.1
```

### `Adapter` — the integration boundary (ABC)

Every integration (Slack, Resend, Twilio, Postgres, ...) implements two methods:

```python
class Adapter(ABC):
    name: str

    @abstractmethod
    def normalise(self, method: str, kwargs: dict) -> ToolCall: ...

    @abstractmethod
    async def execute(self, call: ToolCall, decision: Decision): ...
```

`normalise` translates the SDK's call shape into a `ToolCall`. `execute` enacts whatever the firewall decided — sending the call (Allow), sending it modified (Rewrite), parking it for review (Approve), or refusing it (Deny).

### `Firewall` — the orchestrator

Loads a policy file, evaluates each `ToolCall` against it, and produces a `Decision`. Wraps an adapter so the agent code can keep using the underlying SDK's API.

```python
class Firewall:
    def __init__(self, config: dict | None = None): ...

    @classmethod
    def from_file(cls, path: str | Path) -> "Firewall": ...   # v0.1

    def wrap(self, adapter: Adapter) -> Adapter: ...          # v0.1
```

---

## Target API (v0.1)

This is what the landing page advertises and what `v0.1` will deliver:

```python
import os
from parlok import Firewall
from parlok.adapters.slack import SlackAdapter

fw = Firewall.from_file("firewall.yaml")
slack = fw.wrap(SlackAdapter(token=os.environ["SLACK_TOKEN"]))

# Same API as the Slack SDK — now policy-checked.
await slack.chat_postMessage(channel="#sales", text="Closed a deal")
```

Example `firewall.yaml`:

```yaml
version: 1
policies:
  - name: external-message-approval
    match:
      adapter: [slack, email]
    when: recipient.is_external
    decision: approve
    via: slack_approval_card

  - name: redact-pii
    match:
      adapter: [slack, email]
    decision: rewrite
    transforms: [redact_pii, clamp_length(2000)]

  - name: block-prod-drops
    match:
      adapter: postgres
      action: execute
    when: body.matches("(?i)\\bdrop\\s+table\\b")
    decision: deny
    reason: "Destructive schema change blocked in production."
```

---

## What works today (`v0.0.1`)

- `import parlok` — clean import, no side effects.
- `parlok.__version__ == "0.0.1"`.
- `parlok.__all__` exposes `Adapter`, `ToolCall`, `Decision`, `DecisionKind`, `Firewall`.
- `ToolCall(...)` and `Decision(...)` construct as dataclasses with the documented fields.
- `Adapter` is an ABC — subclasses must implement `normalise` and `execute` to instantiate.
- `Firewall()` and `Firewall(config={...})` construct successfully.
- `Firewall.from_file(...)` raises `NotImplementedError("YAML loader lands in v0.1")`.
- `Firewall().wrap(adapter)` raises `NotImplementedError("wrap() lands in v0.1")`.
- `Decision(kind="rewrite").apply_rewrite(call=...)` raises `NotImplementedError("Rewrite transforms land in v0.1")`.

The 16-test suite under `tests/` pins this surface so future refactors can't silently break the public contract.

---

## Roadmap

### v0.1 — first usable cut (messaging)

- YAML schema + loader (`Firewall.from_file`).
- Policy engine: match/when/decision evaluation.
- `Firewall.wrap(adapter)` that proxies the underlying SDK and routes calls through policy.
- First adapter: **Slack** (`chat_postMessage` end-to-end).
- Rewrite transform library: `redact_pii`, `redact_secrets`, `clamp_length`, `strip_urls`, `tone_check`, `enforce_template`.
- Approve triggers: `external_recipient`, `contains_keywords`, `financial_mention`, `vip_recipient`, `after_hours`, `bulk_send`, `first_time_recipient`.
- HITL: Slack Block Kit approval cards + generic webhook.
- SQLite state store + audit log.
- CLI: `parlok lint`, `parlok test`.

### v0.2 — refunds

- Adapters for finance/payments tools.
- Threshold-based approval (`when: metadata.amount > 50000`).

### v0.3 — database writes

- `postgres` adapter (and friends).
- Pattern-match destructive statements (`DROP TABLE`, `TRUNCATE`, mass `DELETE`, ...).
- Production-environment scoping.

### Future

- TypeScript SDK (`sdk/typescript/`) mirroring this surface.
- Hosted control plane: policy distribution, audit log aggregation, approval inbox.
- Additional adapters: Resend / SES / SMTP / Postmark, Twilio, Stripe, generic HTTP.

---

## Install & test

```bash
cd sdk/python
pip install -e ".[dev]"
pytest
```

Expected: 16 tests pass.

## Layout

```
sdk/python/
├── pyproject.toml
├── README.md                  # you are here
├── src/parlok/
│   ├── __init__.py            # public exports + __version__
│   ├── toolcall.py            # ToolCall dataclass
│   ├── decision.py            # Decision dataclass + DecisionKind literal
│   ├── adapter.py             # Adapter ABC
│   └── firewall.py            # Firewall (stubs until v0.1)
└── tests/
    ├── test_toolcall.py
    ├── test_decision.py
    ├── test_adapter.py
    ├── test_firewall.py
    └── test_smoke.py          # public-surface contract test
```

## Design principles

- **Same API as the wrapped SDK.** Agents shouldn't need to learn a new interface to get policy enforcement.
- **Policy in YAML, not code.** Security/ops own the rules; engineers own the agent.
- **Fail closed on missing policy.** If the firewall can't evaluate a call, it doesn't get sent.
- **Adapters are thin.** The interesting logic lives in the policy engine, not in adapter glue.
- **No runtime dependencies in the core.** Adapters bring their own SDK as an optional extra.

## License

MIT — see `LICENSE` at the repo root.
