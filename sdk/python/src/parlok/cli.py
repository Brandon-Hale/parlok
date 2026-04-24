from __future__ import annotations

import argparse
import sys
from importlib.resources import files
from pathlib import Path

from .errors import PolicyError
from .policy.engine import evaluate
from .policy.loader import load_file
from .toolcall import ToolCall


def _cmd_init(args) -> int:
    path = Path(args.path)
    if path.exists() and not args.force:
        print(f"{path} already exists; pass --force to overwrite", file=sys.stderr)
        return 1
    template = files("parlok._templates").joinpath("parlok.starter.yaml").read_text()
    path.write_text(template)
    print(f"wrote {path}")
    return 0


def _cmd_lint(args) -> int:
    try:
        ps = load_file(args.path)
    except PolicyError as e:
        print(f"policy error: {e}", file=sys.stderr)
        return 1
    print(f"ok: {len(ps.policies)} policy(ies) loaded")
    return 0


_SAMPLES = [
    ToolCall(adapter="slack",    action="chat_postMessage",
             recipient="#sales", body="hi a@b.com"),
    ToolCall(adapter="email",    action="send",
             recipient="x@other.com", body="invoice $50,000"),
    ToolCall(adapter="postgres", action="execute",
             body="DROP TABLE users"),
    ToolCall(adapter="twilio",   action="sms",
             recipient="+15551234567", body="hi"),
]


def _cmd_test(args) -> int:
    try:
        ps = load_file(args.path)
    except PolicyError as e:
        print(f"policy error: {e}", file=sys.stderr)
        return 1
    print(f"{'call':<55}  {'decision':<9}  policy")
    for call in _SAMPLES:
        d = evaluate(call, ps)
        summary = f"{call.adapter}.{call.action} -> {call.recipient or ''}"[:55]
        policy = (d.payload or {}).get("policy") or "-"
        print(f"{summary:<55}  {d.kind:<9}  {policy}")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="parlok")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_init = sub.add_parser("init", help="write a starter policy file")
    p_init.add_argument("--path", default="parlok.yaml")
    p_init.add_argument("--force", action="store_true")
    p_init.set_defaults(fn=_cmd_init)

    p_lint = sub.add_parser("lint", help="validate a policy file")
    p_lint.add_argument("path", nargs="?", default="parlok.yaml")
    p_lint.set_defaults(fn=_cmd_lint)

    p_test = sub.add_parser("test", help="show decisions for sample ToolCalls")
    p_test.add_argument("path", nargs="?", default="parlok.yaml")
    p_test.set_defaults(fn=_cmd_test)

    args = parser.parse_args(argv)
    return args.fn(args)


if __name__ == "__main__":
    raise SystemExit(main())
