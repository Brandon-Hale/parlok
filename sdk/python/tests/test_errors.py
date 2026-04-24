from parlok.errors import ParlokDenied, RewriteFailed, PolicyError


def test_parlok_denied_carries_reason():
    e = ParlokDenied("nope")
    assert e.reason == "nope"
    assert str(e) == "nope"


def test_rewrite_failed_is_exception():
    assert issubclass(RewriteFailed, Exception)


def test_policy_error_is_exception():
    assert issubclass(PolicyError, Exception)
