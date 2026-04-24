import pytest
from parlok.adapter import Adapter
from parlok.errors import ParlokDenied
from parlok.firewall import Firewall
from parlok.hitl.base import Approver, ApprovalResult
from parlok.toolcall import ToolCall


class StubApprover(Approver):
    name = "stub"

    def __init__(self, result: ApprovalResult):
        self.result = result
        self.seen = []

    async def request(self, call, reason):
        self.seen.append((call, reason))
        return self.result


class EchoAdapter(Adapter):
    name = "echo"

    def __init__(self):
        self.sent = []

    def normalise(self, method, kwargs):
        return ToolCall(
            adapter="echo", action=method,
            recipient=kwargs.get("to"), body=kwargs.get("text"),
        )

    async def execute(self, call, decision):
        if decision.kind == "deny":
            raise ParlokDenied(decision.reason or "denied")
        self.sent.append((call.recipient, call.body))
        return "sent"


YAML = """
version: 1
policies:
  - name: ext-approve
    match: {adapter: echo}
    decision: approve
    via: stub
    reason: external
"""


async def test_approve_resolves_to_send(tmp_path):
    p = tmp_path / "p.yaml"
    p.write_text(YAML)
    fw = Firewall.from_file(p)
    fw.register_approver(StubApprover(ApprovalResult(kind="approved", reviewer="a")))
    ad = EchoAdapter()
    w = fw.wrap(ad)
    out = await w.send(to="x", text="y")
    assert out == "sent"
    assert ad.sent == [("x", "y")]


async def test_approve_denied_raises(tmp_path):
    p = tmp_path / "p.yaml"
    p.write_text(YAML)
    fw = Firewall.from_file(p)
    fw.register_approver(StubApprover(ApprovalResult(kind="denied", reviewer="a", reason="no")))
    w = fw.wrap(EchoAdapter())
    with pytest.raises(ParlokDenied, match="no"):
        await w.send(to="x", text="y")


async def test_approve_timeout_raises(tmp_path):
    p = tmp_path / "p.yaml"
    p.write_text(YAML)
    fw = Firewall.from_file(p)
    fw.register_approver(StubApprover(ApprovalResult(kind="timeout")))
    w = fw.wrap(EchoAdapter())
    with pytest.raises(ParlokDenied, match="timeout"):
        await w.send(to="x", text="y")
