import pytest
from parlok.adapters.slack import SlackAdapter
from parlok.decision import Decision
from parlok.errors import ParlokDenied


class _Client:
    def __init__(self):
        self.sent = []

    def chat_postMessage(self, **kw):
        self.sent.append(kw)
        return {"ok": True, **kw}


def test_normalise_chat_post_message():
    ad = SlackAdapter(client=_Client())
    call = ad.normalise("chat_postMessage", {"channel": "#sales", "text": "hi"})
    assert call.adapter == "slack"
    assert call.action == "chat_postMessage"
    assert call.recipient == "#sales"
    assert call.body == "hi"


async def test_execute_allow_sends():
    client = _Client()
    ad = SlackAdapter(client=client)
    call = ad.normalise("chat_postMessage", {"channel": "#x", "text": "yo"})
    await ad.execute(call, Decision(kind="allow"))
    assert len(client.sent) == 1
    assert client.sent[0]["channel"] == "#x"
    assert client.sent[0]["text"] == "yo"


async def test_execute_rewrite_applies_transforms():
    client = _Client()
    ad = SlackAdapter(client=client)
    call = ad.normalise("chat_postMessage", {"channel": "#x", "text": "a@b.com"})
    dec = Decision(kind="rewrite", payload={"transforms": [("redact_pii", [])]})
    await ad.execute(call, dec)
    assert "a@b.com" not in client.sent[0]["text"]


async def test_execute_deny_raises():
    ad = SlackAdapter(client=_Client())
    call = ad.normalise("chat_postMessage", {"channel": "#x", "text": "hi"})
    with pytest.raises(ParlokDenied):
        await ad.execute(call, Decision(kind="deny", reason="nope"))
