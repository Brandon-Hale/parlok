import asyncio
import inspect
import pytest
from parlok.toolcall import ToolCall
from parlok.decision import Decision
from parlok.adapter import Adapter
from parlok._proxy import WrappedAdapter
from parlok.errors import ParlokDenied


class _SpyAdapter(Adapter):
    name = "spy"

    class _Client:
        def ping(self, **kw):
            return ("sync", kw)

        async def apping(self, **kw):
            return ("async", kw)

    def __init__(self):
        self._client = self._Client()
        self.executed = []

    def normalise(self, method, kwargs):
        return ToolCall(adapter="spy", action=method, body=repr(kwargs))

    async def execute(self, call, decision):
        self.executed.append((call, decision))
        if decision.kind == "deny":
            raise ParlokDenied(decision.reason or "denied")
        target = getattr(self._client, call.action)
        kw = eval(call.body)  # test-only; body is repr of original kwargs
        if inspect.iscoroutinefunction(target):
            return await target(**kw)
        return target(**kw)


class _Fw:
    def __init__(self, decision):
        self._d = decision
        self._approvers = {}

    def _evaluate(self, call):
        return self._d

    async def _dispatch(self, adapter, call):
        decision = self._evaluate(call)
        return await adapter.execute(call, decision)


async def test_proxy_passes_through_sync():
    w = WrappedAdapter(_SpyAdapter(), _Fw(Decision(kind="allow")))
    out = await w.ping(x=1)
    assert out == ("sync", {"x": 1})


async def test_proxy_passes_through_async():
    w = WrappedAdapter(_SpyAdapter(), _Fw(Decision(kind="allow")))
    out = await w.apping(y=2)
    assert out == ("async", {"y": 2})


async def test_proxy_raises_on_deny():
    w = WrappedAdapter(_SpyAdapter(), _Fw(Decision(kind="deny", reason="nope")))
    with pytest.raises(ParlokDenied, match="nope"):
        await w.ping(x=1)
