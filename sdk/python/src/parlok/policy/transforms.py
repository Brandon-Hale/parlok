"""Rewrite transforms. Each is pure: takes a ToolCall, returns a new one."""
from __future__ import annotations

import re
from dataclasses import replace
from typing import Any, Callable

from ..errors import RewriteFailed
from ..toolcall import ToolCall

_EMAIL_RE   = re.compile(r"[\w\.\-+]+@[\w\-]+\.[\w\.\-]+")
_PHONE_RE   = re.compile(r"(?:\+?\d[\s\-]?){7,}\d")
_SSN_RE     = re.compile(r"\b\d{3}-\d{2}-\d{4}\b")
_AWS_RE     = re.compile(r"\b(AKIA|ASIA)[0-9A-Z]{16}\b")
_GH_RE      = re.compile(r"\bgh[pousr]_[A-Za-z0-9]{30,}\b")
_SLACK_RE   = re.compile(r"\bxox[baprs]-[A-Za-z0-9\-]{10,}\b")
_STRIPE_RE  = re.compile(r"\bsk_(?:live|test)_[A-Za-z0-9]{10,}\b")
_BEARER_RE  = re.compile(r"\bBearer\s+[A-Za-z0-9\-_\.]+", re.IGNORECASE)
_JWT_RE     = re.compile(r"\b[A-Za-z0-9\-_]{10,}\.[A-Za-z0-9\-_]{10,}\.[A-Za-z0-9\-_]{10,}\b")
_URL_RE     = re.compile(r"https?://\S+")
_ALLCAPS_RE = re.compile(r"\b[A-Z]{4,}\b")
_PROFANITY  = {"damn", "hell", "shit", "fuck"}


def _sub(body: str | None, pattern: re.Pattern[str], repl: str) -> str | None:
    if body is None:
        return None
    return pattern.sub(repl, body)


def redact_pii(call: ToolCall) -> ToolCall:
    b = _sub(call.body, _EMAIL_RE, "[redacted]")
    b = _sub(b, _PHONE_RE, "[redacted]")
    b = _sub(b, _SSN_RE, "[redacted]")
    return replace(call, body=b)


def redact_secrets(call: ToolCall) -> ToolCall:
    b = call.body
    for pat in (_AWS_RE, _GH_RE, _SLACK_RE, _STRIPE_RE, _BEARER_RE, _JWT_RE):
        b = _sub(b, pat, "[redacted-secret]")
    return replace(call, body=b)


def clamp_length(call: ToolCall, n: int) -> ToolCall:
    if call.body is None or len(call.body) <= n:
        return call
    return replace(call, body=call.body[:n] + "…")


def strip_urls(call: ToolCall) -> ToolCall:
    return replace(call, body=_sub(call.body, _URL_RE, "[url]"))


def tone_check(call: ToolCall) -> ToolCall:
    if call.body is None:
        return call
    b = _ALLCAPS_RE.sub(lambda m: m.group(0).lower(), call.body)
    for word in _PROFANITY:
        b = re.sub(rf"\b{re.escape(word)}\b", "****", b, flags=re.IGNORECASE)
    return replace(call, body=b)


def enforce_template(call: ToolCall, pattern: str) -> ToolCall:
    if call.body is None or not re.search(pattern, call.body):
        raise RewriteFailed(f"body does not match template /{pattern}/")
    return call


REGISTRY: dict[str, Callable[..., ToolCall]] = {
    "redact_pii": redact_pii,
    "redact_secrets": redact_secrets,
    "clamp_length": clamp_length,
    "strip_urls": strip_urls,
    "tone_check": tone_check,
    "enforce_template": enforce_template,
}


def apply_transforms(call: ToolCall, specs: list[tuple[str, list[Any]]]) -> ToolCall:
    for name, args in specs:
        fn = REGISTRY.get(name)
        if fn is None:
            raise RewriteFailed(f"unknown transform: {name}")
        call = fn(call, *args)
    return call
