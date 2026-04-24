import pytest
from parlok.policy.expr import parse, evaluate
from parlok.errors import PolicyError


def ev(src, ctx=None, funcs=None):
    return evaluate(parse(src), ctx or {}, funcs or {})


def test_literal_true():
    assert ev("true") is True


def test_and_or_precedence():
    assert ev("true or false and false") is True


def test_not():
    assert ev("not false") is True


def test_comparison():
    assert ev("1 < 2") is True
    assert ev("'a' == 'a'") is True


def test_dotted_access():
    ctx = {"recipient": {"is_external": True}}
    assert ev("recipient.is_external", ctx) is True


def test_deep_dotted_access():
    ctx = {"metadata": {"amount": 42}}
    assert ev("metadata.amount > 10", ctx) is True


def test_in_list():
    assert ev("'slack' in ['slack', 'email']") is True


def test_in_string():
    assert ev("'x' in 'abc'") is False


def test_regex_method():
    ctx = {"body": "DROP TABLE users"}
    assert ev('body.matches("(?i)\\\\bdrop\\\\s+table\\\\b")', ctx) is True


def test_function_call():
    funcs = {"after_hours": lambda *a, **kw: True}
    assert ev("after_hours('UTC', 9, 17)", funcs=funcs) is True


def test_unknown_identifier_is_none_not_error():
    assert ev("missing", {}) is None


def test_missing_attribute_is_none():
    ctx = {"body": "hi"}
    assert ev("body.nope", ctx) is None


def test_parser_raises_on_garbage():
    with pytest.raises(PolicyError):
        parse("1 + + 2")
