from parlok.toolcall import ToolCall
from parlok.policy.triggers import (
    contains_keywords, financial_mention, after_hours, bulk_send,
)
from parlok.policy.resolvers import (
    is_external_recipient, is_vip_recipient,
)


def test_contains_keywords_hit():
    call = ToolCall(adapter="slack", action="post", body="Quarterly budget review")
    assert contains_keywords(call, ["budget", "forecast"]) is True


def test_contains_keywords_miss():
    call = ToolCall(adapter="slack", action="post", body="lunch plans")
    assert contains_keywords(call, ["budget"]) is False


def test_financial_mention_by_regex():
    call = ToolCall(adapter="email", action="send", body="invoice for $50,000")
    assert financial_mention(call) is True


def test_financial_mention_by_metadata():
    call = ToolCall(adapter="x", action="y", metadata={"amount": 1000})
    assert financial_mention(call) is True


def test_bulk_send():
    call = ToolCall(adapter="x", action="y", metadata={"recipients": list(range(25))})
    assert bulk_send(call, 10) is True
    assert bulk_send(call, 30) is False


def test_after_hours_noon_weekday_is_false():
    import datetime as dt
    now = dt.datetime(2026, 4, 24, 12, 0)
    assert after_hours("UTC", 9, 17, now=now) is False


def test_after_hours_evening_is_true():
    import datetime as dt
    now = dt.datetime(2026, 4, 24, 20, 0)
    assert after_hours("UTC", 9, 17, now=now) is True


def test_is_external_recipient_email():
    call = ToolCall(adapter="email", action="send", recipient="x@evil.example")
    assert is_external_recipient(call, ["acme.com"]) is True
    call2 = ToolCall(adapter="email", action="send", recipient="y@acme.com")
    assert is_external_recipient(call2, ["acme.com"]) is False


def test_is_vip_recipient():
    call = ToolCall(adapter="email", action="send", recipient="ceo@acme.com")
    assert is_vip_recipient(call, ["ceo@acme.com"]) is True
