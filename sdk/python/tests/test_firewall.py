from parlok.firewall import Firewall
from parlok.adapter import Adapter
from parlok.toolcall import ToolCall
from parlok.decision import Decision


class FakeAdapter(Adapter):
    name = "fake"

    def normalise(self, method: str, kwargs: dict) -> ToolCall:
        return ToolCall(adapter=self.name, action=method)

    async def execute(self, call: ToolCall, decision: Decision):
        return None


def test_firewall_instantiates_with_no_args():
    fw = Firewall()
    assert fw is not None


def test_firewall_instantiates_with_config():
    fw = Firewall(config={"version": 1})
    assert fw is not None


def test_firewall_from_file_loads_policies(tmp_path):
    p = tmp_path / "policy.yaml"
    p.write_text("version: 1\npolicies:\n  - name: x\n    decision: allow\n")
    fw = Firewall.from_file(p)
    assert fw is not None


def test_firewall_wrap_returns_wrapper():
    fw = Firewall()
    wrapped = fw.wrap(FakeAdapter())
    assert wrapped is not None
