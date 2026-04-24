from parlok.toolcall import ToolCall
from parlok.policy.loader import load_string
from parlok.policy.engine import evaluate


def ev(yaml_src, call, state=None):
    ps = load_string(yaml_src)
    return evaluate(call, ps, state=state)


BASE = """
version: 1
allowed_domains: [acme.com]
policies:
  - name: deny-drops
    match: {adapter: postgres, action: execute}
    when: body.matches("(?i)drop\\\\s+table")
    decision: deny
    reason: prod-drop
  - name: redact-pii
    match: {adapter: slack}
    decision: rewrite
    transforms: [redact_pii]
  - name: approve-external
    match: {adapter: email}
    when: recipient.is_external
    decision: approve
    via: slack_card
  - name: allow-internal-email
    match: {adapter: email}
    decision: allow
"""


def test_first_match_wins_and_chooses_deny():
    c = ToolCall(adapter="postgres", action="execute", body="DROP TABLE users")
    d = ev(BASE, c)
    assert d.kind == "deny"
    assert d.reason == "prod-drop"


def test_slack_call_gets_rewrite():
    c = ToolCall(adapter="slack", action="chat_postMessage", body="email a@b.com")
    d = ev(BASE, c)
    assert d.kind == "rewrite"
    assert d.payload["transforms"] == [("redact_pii", [])]


def test_external_email_gets_approve():
    c = ToolCall(adapter="email", action="send", recipient="x@other.com")
    d = ev(BASE, c)
    assert d.kind == "approve"
    assert d.payload["via"] == "slack_card"


def test_internal_email_allowed():
    c = ToolCall(adapter="email", action="send", recipient="y@acme.com")
    d = ev(BASE, c)
    assert d.kind == "allow"


def test_no_match_fails_closed():
    c = ToolCall(adapter="twilio", action="sms")
    d = ev(BASE, c)
    assert d.kind == "deny"
    assert "no policy matched" in d.reason


def test_match_wildcards_any_adapter():
    y = """
    version: 1
    policies:
      - name: allow-all
        decision: allow
    """
    c = ToolCall(adapter="whatever", action="do")
    assert ev(y, c).kind == "allow"


def test_match_adapter_list():
    y = """
    version: 1
    policies:
      - name: ok
        match: {adapter: [slack, email]}
        decision: allow
    """
    assert ev(y, ToolCall(adapter="slack", action="x")).kind == "allow"
    assert ev(y, ToolCall(adapter="twilio", action="x")).kind == "deny"
