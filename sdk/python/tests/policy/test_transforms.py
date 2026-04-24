from parlok.toolcall import ToolCall
from parlok.policy.transforms import apply_transforms, REGISTRY


def tc(**kw):
    return ToolCall(adapter="x", action="y", **kw)


def test_redact_pii_email():
    out = apply_transforms(tc(body="mail me at a@b.com"), [("redact_pii", [])])
    assert "a@b.com" not in out.body
    assert "[redacted]" in out.body


def test_redact_pii_phone():
    out = apply_transforms(tc(body="call +1 415 555 0100"), [("redact_pii", [])])
    assert "415" not in out.body


def test_redact_secrets_aws():
    out = apply_transforms(tc(body="key AKIAIOSFODNN7EXAMPLE done"), [("redact_secrets", [])])
    assert "AKIA" not in out.body


def test_redact_secrets_github():
    out = apply_transforms(tc(body="token ghp_1234567890abcdefGHIJKLMNOPQRSTUVWXYZ"), [("redact_secrets", [])])
    assert "ghp_" not in out.body


def test_clamp_length_truncates():
    out = apply_transforms(tc(body="x" * 50), [("clamp_length", [10])])
    assert len(out.body) == 11
    assert out.body.endswith("…")


def test_clamp_length_noop_when_short():
    out = apply_transforms(tc(body="hi"), [("clamp_length", [10])])
    assert out.body == "hi"


def test_strip_urls():
    out = apply_transforms(tc(body="see https://evil.example/x now"), [("strip_urls", [])])
    assert "https://" not in out.body


def test_tone_check_allcaps():
    out = apply_transforms(tc(body="THIS IS LOUD ok"), [("tone_check", [])])
    assert "THIS" not in out.body
    assert "this" in out.body.lower()


def test_transforms_are_pure():
    c = tc(body="a@b.com")
    apply_transforms(c, [("redact_pii", [])])
    assert c.body == "a@b.com"


def test_registry_exposes_names():
    assert set(REGISTRY).issuperset(
        {"redact_pii", "redact_secrets", "clamp_length", "strip_urls", "tone_check", "enforce_template"}
    )
