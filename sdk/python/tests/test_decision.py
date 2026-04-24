from parlok.decision import Decision
from parlok.toolcall import ToolCall


def test_decision_minimal_construction():
    d = Decision(kind="allow")
    assert d.kind == "allow"
    assert d.reason is None
    assert d.payload == {}


def test_decision_with_reason_and_payload():
    d = Decision(kind="deny", reason="after hours", payload={"hour": 23})
    assert d.kind == "deny"
    assert d.reason == "after hours"
    assert d.payload == {"hour": 23}


def test_decision_apply_rewrite_noop_when_no_transforms():
    d = Decision(kind="rewrite")
    c = ToolCall(adapter="x", action="y", body="hi")
    assert d.apply_rewrite(c) is c
