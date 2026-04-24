from parlok.toolcall import ToolCall


def test_toolcall_minimal_construction():
    call = ToolCall(adapter="slack", action="chat_postMessage")
    assert call.adapter == "slack"
    assert call.action == "chat_postMessage"
    assert call.recipient is None
    assert call.body is None
    assert call.subject is None
    assert call.metadata == {}


def test_toolcall_full_construction():
    call = ToolCall(
        adapter="email",
        action="send",
        recipient="user@example.com",
        body="Hello",
        subject="Hi",
        metadata={"attachments": []},
    )
    assert call.recipient == "user@example.com"
    assert call.body == "Hello"
    assert call.subject == "Hi"
    assert call.metadata == {"attachments": []}


def test_toolcall_metadata_default_is_not_shared():
    a = ToolCall(adapter="x", action="y")
    b = ToolCall(adapter="x", action="y")
    a.metadata["k"] = 1
    assert "k" not in b.metadata
