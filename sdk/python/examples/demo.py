"""Runnable demo for the parlok SDK.

Spins up two fake adapters (Slack-ish and email-ish) plus a postgres adapter,
wires them through a Firewall loaded from ./parlok.yaml, and walks a handful
of scripted tool calls through the policy engine.

By default, human-in-the-loop approvals are auto-resolved so the demo runs
end-to-end with no prompting. Pass --interactive to be asked [y/n] at the
console for each approve decision.

Run:
    cd sdk/python/examples
    python demo.py                 # auto-approves
    python demo.py --interactive   # prompts for each approval
    python demo.py --deny-all      # auto-denies every approval
"""
from __future__ import annotations

import argparse
import asyncio
from pathlib import Path

from parlok.adapter import Adapter
from parlok.decision import Decision
from parlok.errors import ParlokDenied
from parlok.firewall import Firewall
from parlok.hitl.base import ApprovalResult, Approver
from parlok.toolcall import ToolCall


# ---------------------------------------------------------------------------
# Fake adapters. Each normalises its native call shape into a ToolCall and
# enacts the firewall's decision against a stub "client" that just prints.
# ---------------------------------------------------------------------------


class PrintingClient:
    def __init__(self, label: str):
        self._label = label
        self.sent: list[dict] = []

    def send(self, **kw) -> dict:
        self.sent.append(kw)
        print(f"    [{self._label} CLIENT] -> {kw}")
        return {"ok": True, **kw}


class FakeSlackAdapter(Adapter):
    name = "slack"

    def __init__(self):
        self._client = PrintingClient("slack")

    def normalise(self, method: str, kwargs: dict) -> ToolCall:
        return ToolCall(
            adapter=self.name,
            action=method,
            recipient=kwargs.get("channel"),
            body=kwargs.get("text"),
        )

    async def execute(self, call: ToolCall, decision: Decision):
        if decision.kind == "deny":
            raise ParlokDenied(decision.reason or "denied")
        if decision.kind == "rewrite":
            call = decision.apply_rewrite(call)
        return self._client.send(channel=call.recipient, text=call.body)


class FakeEmailAdapter(Adapter):
    name = "email"

    def __init__(self):
        self._client = PrintingClient("email")

    def normalise(self, method: str, kwargs: dict) -> ToolCall:
        return ToolCall(
            adapter=self.name,
            action=method,
            recipient=kwargs.get("to"),
            body=kwargs.get("body"),
            subject=kwargs.get("subject"),
        )

    async def execute(self, call: ToolCall, decision: Decision):
        if decision.kind == "deny":
            raise ParlokDenied(decision.reason or "denied")
        if decision.kind == "rewrite":
            call = decision.apply_rewrite(call)
        return self._client.send(
            to=call.recipient, subject=call.subject, body=call.body
        )


class FakePostgresAdapter(Adapter):
    name = "postgres"

    def __init__(self):
        self._client = PrintingClient("postgres")

    def normalise(self, method: str, kwargs: dict) -> ToolCall:
        return ToolCall(adapter=self.name, action=method, body=kwargs.get("sql"))

    async def execute(self, call: ToolCall, decision: Decision):
        if decision.kind == "deny":
            raise ParlokDenied(decision.reason or "denied")
        return self._client.send(sql=call.body)


# ---------------------------------------------------------------------------
# Approvers: console-based for live testing; auto-resolvers for scripted runs.
# ---------------------------------------------------------------------------


class ConsoleApprover(Approver):
    """Prompt at stdin for approve/deny. Empty reply = approve."""

    name = "console"

    async def request(self, call: ToolCall, policy_reason: str) -> ApprovalResult:
        print(f"\n    [HUMAN APPROVAL NEEDED] reason: {policy_reason}")
        print(f"      {call.adapter}.{call.action} -> {call.recipient}")
        print(f"      body: {(call.body or '')[:200]}")
        answer = input("      approve? [Y/n] ").strip().lower()
        if answer in ("", "y", "yes"):
            return ApprovalResult(kind="approved", reviewer="console-user")
        return ApprovalResult(kind="denied", reviewer="console-user", reason=answer or "denied")


class ScriptedApprover(Approver):
    """Auto-resolve every request with the configured outcome."""

    name = "console"  # same name, so it plugs into `via: console`

    def __init__(self, outcome: str):
        self._outcome = outcome

    async def request(self, call: ToolCall, policy_reason: str) -> ApprovalResult:
        print(f"    [AUTO-{self._outcome.upper()}] reason: {policy_reason}"
              f" ({call.adapter}.{call.action} -> {call.recipient})")
        if self._outcome == "approved":
            return ApprovalResult(kind="approved", reviewer="auto-approver")
        return ApprovalResult(kind="denied", reviewer="auto-approver", reason="auto-deny")


# ---------------------------------------------------------------------------
# Scripted scenarios. Each is a (label, async fn(slack, email, postgres))
# tuple. We catch ParlokDenied so the demo keeps going across denials.
# ---------------------------------------------------------------------------


SCENARIOS: list[tuple[str, str]] = [
    ("allow   : internal Slack message",
     "await slack.chat_postMessage(channel='#eng', text='deploy finished')"),
    ("rewrite : Slack message containing a GitHub token",
     "await slack.chat_postMessage(channel='#eng', "
     "text='leak: ghp_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa — rotate me')"),
    ("rewrite : email with PII",
     "await email.send(to='dev@acme.com', subject='on-call', "
     "body='call alice at a@acme.com or +1 415 555 0100')"),
    ("approve : external financial email",
     "await email.send(to='cfo@customer.example', subject='invoice', "
     "body='Wire $50,000 today please')"),
    ("approve : VIP recipient",
     "await email.send(to='ceo@acme.com', subject='hi', body='quick q')"),
    ("deny    : DROP TABLE on postgres",
     "await postgres.execute(sql='DROP TABLE users')"),
    ("deny    : unknown adapter (fail-closed)",
     "await twilio.sms(to='+15551234567', text='hi')"),
]


async def run_scenario(label: str, snippet: str, ns: dict) -> None:
    print(f"\n>>> {label}")
    print(f"    $ {snippet}")
    try:
        # The scenarios are just small expressions; exec them in the shared ns.
        exec(f"async def _s():\n    return {snippet}", ns)
        result = await ns["_s"]()
        if result is not None:
            print(f"    result: {result}")
    except ParlokDenied as e:
        print(f"    BLOCKED: {e.reason}")
    except (AttributeError, NameError) as e:
        print(f"    NOT WIRED: {e}")


async def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="parlok SDK demo")
    mode = ap.add_mutually_exclusive_group()
    mode.add_argument("--interactive", action="store_true",
                      help="prompt for each approval at the console")
    mode.add_argument("--deny-all", action="store_true",
                      help="auto-deny every approval (instead of auto-approve)")
    ap.add_argument("--policy", default=str(Path(__file__).with_name("parlok.yaml")),
                    help="policy file to load")
    args = ap.parse_args(argv)

    fw = Firewall.from_file(args.policy)

    if args.interactive:
        fw.register_approver(ConsoleApprover())
    elif args.deny_all:
        fw.register_approver(ScriptedApprover("denied"))
    else:
        fw.register_approver(ScriptedApprover("approved"))

    slack_ad = FakeSlackAdapter()
    email_ad = FakeEmailAdapter()
    postgres_ad = FakePostgresAdapter()

    ns = {
        "slack":    fw.wrap(slack_ad),
        "email":    fw.wrap(email_ad),
        "postgres": fw.wrap(postgres_ad),
    }

    print("parlok demo — policies loaded:")
    for pol in fw._policies.policies:  # type: ignore[union-attr]
        print(f"  - {pol.name}  ({pol.decision})")

    for label, snippet in SCENARIOS:
        await run_scenario(label, snippet, ns)

    print("\ndone.")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
