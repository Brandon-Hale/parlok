import pytest
from parlok.policy.loader import load_string, load_file
from parlok.errors import PolicyError


GOOD = """
version: 1
allowed_domains: [acme.com]
policies:
  - name: redact-pii
    match: {adapter: slack}
    decision: rewrite
    transforms: [redact_pii, clamp_length(2000)]
  - name: deny-drops
    match: {adapter: postgres, action: execute}
    when: body.matches("(?i)\\\\bdrop\\\\s+table\\\\b")
    decision: deny
    reason: prod-drop
  - name: approve-ext
    match: {adapter: slack}
    when: recipient.is_external
    decision: approve
    via: slack_card
"""


def test_loads_good_policy_set():
    ps = load_string(GOOD)
    assert ps.version == 1
    assert ps.allowed_domains == ["acme.com"]
    names = [p.name for p in ps.policies]
    assert names == ["redact-pii", "deny-drops", "approve-ext"]


def test_transforms_are_parsed_into_name_args():
    ps = load_string(GOOD)
    redact = ps.policies[0]
    assert redact.transforms == [("redact_pii", []), ("clamp_length", [2000])]


def test_unknown_transform_raises():
    bad = """
    version: 1
    policies:
      - name: x
        match: {adapter: slack}
        decision: rewrite
        transforms: [no_such_transform]
    """
    with pytest.raises(PolicyError, match="unknown transform"):
        load_string(bad)


def test_version_must_be_one():
    with pytest.raises(PolicyError, match="version"):
        load_string("version: 2\npolicies: []\n")


def test_unknown_policy_key_raises():
    bad = """
    version: 1
    policies:
      - name: x
        match: {adapter: slack}
        decision: allow
        surprise: true
    """
    with pytest.raises(PolicyError, match="unknown key"):
        load_string(bad)


def test_rewrite_requires_transforms():
    bad = """
    version: 1
    policies:
      - name: x
        match: {adapter: slack}
        decision: rewrite
    """
    with pytest.raises(PolicyError, match="transforms"):
        load_string(bad)


def test_approve_requires_via():
    bad = """
    version: 1
    policies:
      - name: x
        match: {adapter: slack}
        decision: approve
    """
    with pytest.raises(PolicyError, match="via"):
        load_string(bad)


def test_when_expression_is_precompiled():
    ps = load_string(GOOD)
    assert ps.policies[1].when_expr is not None


def test_load_file(tmp_path):
    p = tmp_path / "policy.yaml"
    p.write_text(GOOD)
    ps = load_file(p)
    assert len(ps.policies) == 3
