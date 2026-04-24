import asyncio
from parlok.toolcall import ToolCall
from parlok.state import StateStore
from parlok.hitl.slack_card import SlackApproverCard


class _FakeSlackClient:
    def __init__(self):
        self.calls = []

    def chat_postMessage(self, **kw):
        self.calls.append(kw)
        return {"ok": True, "ts": "123.456"}


async def test_slack_approver_resolves_on_approval(tmp_path):
    store = StateStore(tmp_path / "s.db")
    client = _FakeSlackClient()
    approver = SlackApproverCard(
        client=client, channel="#approvals", store=store, timeout=5,
    )
    call = ToolCall(
        adapter="slack", action="chat_postMessage",
        recipient="#sales", body="hi",
    )

    async def resolve_soon():
        # poll briefly for the pending row
        for _ in range(50):
            pending = store.list_pending()
            if pending:
                approver.resolve(pending[0]["id"], "approved", "alice", None)
                return
            await asyncio.sleep(0.01)

    resolve_task = asyncio.create_task(resolve_soon())
    result = await approver.request(call, "policy-foo")
    await resolve_task

    assert result.kind == "approved"
    assert result.reviewer == "alice"
    assert len(client.calls) == 1


async def test_slack_approver_times_out(tmp_path):
    store = StateStore(tmp_path / "s.db")
    approver = SlackApproverCard(
        client=_FakeSlackClient(), channel="#a", store=store, timeout=0.05,
    )
    result = await approver.request(
        ToolCall(
            adapter="slack", action="chat_postMessage",
            recipient="#x", body="y",
        ),
        "r",
    )
    assert result.kind == "timeout"
