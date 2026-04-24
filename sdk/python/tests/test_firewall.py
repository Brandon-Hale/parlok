import pytest
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


def test_firewall_from_file_raises_not_implemented():
    with pytest.raises(NotImplementedError, match="v0.1"):
        Firewall.from_file("firewall.yaml")


def test_firewall_wrap_raises_not_implemented():
    fw = Firewall()
    with pytest.raises(NotImplementedError, match="v0.1"):
        fw.wrap(FakeAdapter())
