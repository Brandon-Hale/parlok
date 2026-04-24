from parlok.audit import AuditLog
from parlok.decision import Decision
from parlok.toolcall import ToolCall


def test_audit_logs_decision(tmp_path):
    log = AuditLog(tmp_path / "a.db")
    call = ToolCall(adapter="slack", action="chat_postMessage", recipient="#sales", body="hi")
    log.write(call, Decision(kind="allow", payload={"policy": "p"}))
    rows = log.tail(10)
    assert len(rows) == 1
    assert rows[0]["adapter"] == "slack"
    assert rows[0]["decision_kind"] == "allow"
    assert rows[0]["policy"] == "p"
