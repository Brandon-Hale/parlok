"""YAML policy loader. Produces typed Policy objects; validates at load-time."""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import yaml

from ..errors import PolicyError
from .expr import Node, parse as parse_expr
from .transforms import REGISTRY as TRANSFORM_REGISTRY

_ALLOWED_POLICY_KEYS = {
    "name", "match", "when", "decision", "transforms", "via", "reason",
}
_ALLOWED_ROOT_KEYS = {
    "version", "policies", "state_db", "allowed_domains", "vip_recipients",
    "templates",
}
_ALLOWED_MATCH_KEYS = {"adapter", "action"}
_VALID_DECISIONS = {"allow", "rewrite", "approve", "deny"}

_TRANSFORM_SPEC_RE = re.compile(r"^([A-Za-z_][A-Za-z0-9_]*)(?:\((.*)\))?$")


@dataclass
class Policy:
    name: str
    match: dict[str, Any]
    decision: str
    when_src: str | None = None
    when_expr: Node | None = None
    transforms: list[tuple[str, list[Any]]] = field(default_factory=list)
    via: str | None = None
    reason: str | None = None


@dataclass
class PolicySet:
    version: int
    policies: list[Policy]
    state_db: str = "./.parlok/state.db"
    allowed_domains: list[str] = field(default_factory=list)
    vip_recipients: list[str] = field(default_factory=list)
    templates: dict[str, str] = field(default_factory=dict)


def _parse_transform(spec: str) -> tuple[str, list[Any]]:
    m = _TRANSFORM_SPEC_RE.match(spec.strip())
    if not m:
        raise PolicyError(f"invalid transform spec: {spec!r}")
    name = m.group(1)
    raw_args = m.group(2)
    args: list[Any] = []
    if raw_args:
        for part in raw_args.split(","):
            part = part.strip()
            if not part:
                continue
            try:
                args.append(int(part))
                continue
            except ValueError:
                pass
            try:
                args.append(float(part))
                continue
            except ValueError:
                pass
            if len(part) >= 2 and (part[0], part[-1]) in (('"', '"'), ("'", "'")):
                args.append(part[1:-1])
            else:
                raise PolicyError(f"invalid transform arg: {part!r}")
    if name not in TRANSFORM_REGISTRY:
        raise PolicyError(f"unknown transform: {name}")
    return name, args


def _parse_policy(raw: dict[str, Any]) -> Policy:
    if not isinstance(raw, dict):
        raise PolicyError(f"policy entry must be a mapping, got {type(raw).__name__}")
    unknown = set(raw) - _ALLOWED_POLICY_KEYS
    if unknown:
        raise PolicyError(f"unknown key(s) in policy {raw.get('name')!r}: {sorted(unknown)}")
    name = raw.get("name")
    if not isinstance(name, str) or not name:
        raise PolicyError("policy 'name' is required and must be a string")
    decision = raw.get("decision")
    if decision not in _VALID_DECISIONS:
        raise PolicyError(f"policy {name!r} has invalid decision: {decision!r}")
    match = raw.get("match") or {}
    if not isinstance(match, dict):
        raise PolicyError(f"policy {name!r} match must be a mapping")
    bad_match = set(match) - _ALLOWED_MATCH_KEYS
    if bad_match:
        raise PolicyError(f"policy {name!r} unknown match key(s): {sorted(bad_match)}")

    transforms: list[tuple[str, list[Any]]] = []
    if decision == "rewrite":
        specs = raw.get("transforms")
        if not specs or not isinstance(specs, list):
            raise PolicyError(f"policy {name!r}: rewrite requires 'transforms' list")
        transforms = [_parse_transform(s) for s in specs]
    elif "transforms" in raw:
        raise PolicyError(f"policy {name!r}: 'transforms' only valid with decision=rewrite")

    via = raw.get("via")
    if decision == "approve":
        if not via:
            raise PolicyError(f"policy {name!r}: approve requires 'via'")
    elif via:
        raise PolicyError(f"policy {name!r}: 'via' only valid with decision=approve")

    when_src = raw.get("when")
    when_expr = None
    if when_src is not None:
        if not isinstance(when_src, str):
            raise PolicyError(f"policy {name!r}: 'when' must be a string")
        try:
            when_expr = parse_expr(when_src)
        except PolicyError as e:
            raise PolicyError(f"policy {name!r}: bad when expression: {e}") from e

    return Policy(
        name=name,
        match=match,
        decision=decision,
        when_src=when_src,
        when_expr=when_expr,
        transforms=transforms,
        via=via,
        reason=raw.get("reason"),
    )


def _parse_root(data: Any) -> PolicySet:
    if not isinstance(data, dict):
        raise PolicyError("policy file root must be a mapping")
    unknown = set(data) - _ALLOWED_ROOT_KEYS
    if unknown:
        raise PolicyError(f"unknown top-level key(s): {sorted(unknown)}")
    version = data.get("version")
    if version != 1:
        raise PolicyError(f"unsupported policy version: {version!r} (expected 1)")
    raw_policies = data.get("policies") or []
    if not isinstance(raw_policies, list):
        raise PolicyError("'policies' must be a list")
    policies = [_parse_policy(p) for p in raw_policies]
    names = [p.name for p in policies]
    if len(names) != len(set(names)):
        raise PolicyError(f"duplicate policy names: {names}")
    return PolicySet(
        version=version,
        policies=policies,
        state_db=data.get("state_db") or "./.parlok/state.db",
        allowed_domains=list(data.get("allowed_domains") or []),
        vip_recipients=list(data.get("vip_recipients") or []),
        templates=dict(data.get("templates") or {}),
    )


def load_string(s: str) -> PolicySet:
    try:
        data = yaml.safe_load(s)
    except yaml.YAMLError as e:
        raise PolicyError(f"YAML parse error: {e}") from e
    return _parse_root(data)


def load_file(path: str | Path) -> PolicySet:
    return load_string(Path(path).read_text())
