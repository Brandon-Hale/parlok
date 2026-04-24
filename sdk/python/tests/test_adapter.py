import pytest
from parlok.adapter import Adapter
from parlok.toolcall import ToolCall
from parlok.decision import Decision


def test_adapter_cannot_be_instantiated_directly():
    with pytest.raises(TypeError):
        Adapter()  # type: ignore[abstract]


def test_subclass_must_implement_normalise_and_execute():
    class Incomplete(Adapter):
        name = "incomplete"

    with pytest.raises(TypeError):
        Incomplete()  # type: ignore[abstract]


def test_complete_subclass_instantiates():
    class Complete(Adapter):
        name = "complete"

        def normalise(self, method: str, kwargs: dict) -> ToolCall:
            return ToolCall(adapter=self.name, action=method)

        async def execute(self, call: ToolCall, decision: Decision):
            return "ok"

    adapter = Complete()
    assert adapter.name == "complete"
    call = adapter.normalise("ping", {})
    assert call.adapter == "complete"
    assert call.action == "ping"
