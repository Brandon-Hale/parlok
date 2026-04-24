import pytest
from parlok.firewall import Firewall
from parlok.adapter import Adapter
from parlok.toolcall import ToolCall
from parlok.errors import ParlokDenied


class FakeClient:
    def __init__(self):
        self.sent = []

    def send(self, **kw):
        self.sent.append(kw)
        return {"ok": True, **kw}


class FakeAdapter(Adapter):
    name = "fake"

    def __init__(self):
        self._client = FakeClient()

    def normalise(self, method, kwargs):
        return ToolCall(
            adapter="fake", action=method,
            recipient=kwargs.get("to"), body=kwargs.get("text"),
            metadata={"orig": kwargs},
        )

    async def execute(self, call, decision):
        if decision.kind == "deny":
            raise ParlokDenied(decision.reason or "denied")
        if decision.kind == "rewrite":
            call = decision.apply_rewrite(call)
        return self._client.send(to=call.recipient, text=call.body)


YAML = """
version: 1
allowed_domains: [acme.com]
policies:
  - name: deny-ext
    match: {adapter: fake, action: send}
    when: recipient.is_external
    decision: deny
    reason: external blocked
  - name: redact
    match: {adapter: fake, action: send}
    decision: rewrite
    transforms: [redact_secrets]
"""


async def test_integration_allow_after_rewrite(tmp_path):
    p = tmp_path / "policy.yaml"
    p.write_text(YAML)
    fw = Firewall.from_file(p)
    ad = FakeAdapter()
    w = fw.wrap(ad)
    out = await w.send(to="bob@acme.com", text="hi ghp_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
    assert "ghp_" not in out["text"]


async def test_integration_deny_external(tmp_path):
    p = tmp_path / "policy.yaml"
    p.write_text(YAML)
    fw = Firewall.from_file(p)
    w = fw.wrap(FakeAdapter())
    with pytest.raises(ParlokDenied, match="external"):
        await w.send(to="x@other.com", text="hi")
