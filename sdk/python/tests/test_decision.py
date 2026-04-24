import pytest
from parlok.decision import Decision


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


def test_decision_apply_rewrite_not_implemented():
    d = Decision(kind="rewrite")
    with pytest.raises(NotImplementedError, match="v0.1"):
        d.apply_rewrite(call=None)
