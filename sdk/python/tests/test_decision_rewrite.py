from parlok.decision import Decision
from parlok.toolcall import ToolCall


def test_decision_applies_transform_chain():
    d = Decision(kind="rewrite", payload={
        "transforms": [("redact_pii", []), ("clamp_length", [5])],
    })
    c = ToolCall(adapter="x", action="y", body="email x@y.com here")
    out = d.apply_rewrite(c)
    assert "x@y.com" not in (out.body or "")
    assert len(out.body) <= 6
