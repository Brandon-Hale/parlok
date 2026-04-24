"""Safe mini-expression language for policy ``when`` clauses.

Grammar (low -> high precedence):
    or_expr   := and_expr ("or" and_expr)*
    and_expr  := not_expr ("and" not_expr)*
    not_expr  := "not" not_expr | cmp_expr
    cmp_expr  := primary (("==" | "!=" | "<" | "<=" | ">" | ">=" | "in") primary)?
    primary   := literal | ident_chain | "(" or_expr ")" | "[" list "]"
    ident_chain := IDENT ("." IDENT | "(" args ")")*

No arbitrary Python. Unknown identifiers resolve to None (falsy).
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any, Callable

from ..errors import PolicyError

_TOKEN_SPEC = [
    ("SKIP",   r"\s+"),
    ("FLOAT",  r"\d+\.\d+"),
    ("INT",    r"\d+"),
    ("STRING", r"'(?:\\.|[^'\\])*'|\"(?:\\.|[^\"\\])*\""),
    ("OP",     r"==|!=|<=|>=|<|>|\(|\)|\[|\]|,|\."),
    ("IDENT",  r"[A-Za-z_][A-Za-z0-9_]*"),
]
_TOKEN_RE = re.compile("|".join(f"(?P<{n}>{p})" for n, p in _TOKEN_SPEC))
_KEYWORDS = {"and", "or", "not", "in", "true", "false", "null"}


@dataclass
class Tok:
    kind: str
    value: Any


def _tokenize(src: str) -> list[Tok]:
    toks: list[Tok] = []
    pos = 0
    while pos < len(src):
        m = _TOKEN_RE.match(src, pos)
        if not m:
            raise PolicyError(f"unexpected character at {pos}: {src[pos]!r}")
        kind = m.lastgroup
        value = m.group()
        pos = m.end()
        if kind == "SKIP":
            continue
        if kind == "STRING":
            value = bytes(value[1:-1], "utf-8").decode("unicode_escape")
            toks.append(Tok("STRING", value))
        elif kind == "INT":
            toks.append(Tok("INT", int(value)))
        elif kind == "FLOAT":
            toks.append(Tok("FLOAT", float(value)))
        elif kind == "IDENT":
            if value in _KEYWORDS:
                toks.append(Tok(value.upper(), value))
            else:
                toks.append(Tok("IDENT", value))
        else:
            toks.append(Tok(value, value))
    toks.append(Tok("EOF", None))
    return toks


@dataclass
class Node: ...


@dataclass
class Lit(Node):
    value: Any


@dataclass
class Ident(Node):
    name: str


@dataclass
class Attr(Node):
    target: Node
    name: str


@dataclass
class Call(Node):
    target: Node
    args: list


@dataclass
class ListLit(Node):
    items: list


@dataclass
class BinOp(Node):
    op: str
    left: Node
    right: Node


@dataclass
class UnaryOp(Node):
    op: str
    operand: Node


class _Parser:
    def __init__(self, toks: list[Tok]):
        self.toks = toks
        self.i = 0

    def _peek(self) -> Tok:
        return self.toks[self.i]

    def _eat(self, kind: str) -> Tok:
        t = self.toks[self.i]
        if t.kind != kind:
            raise PolicyError(f"expected {kind}, got {t.kind} ({t.value!r})")
        self.i += 1
        return t

    def parse(self) -> Node:
        node = self._or()
        if self._peek().kind != "EOF":
            raise PolicyError(f"trailing tokens at {self._peek().value!r}")
        return node

    def _or(self) -> Node:
        left = self._and()
        while self._peek().kind == "OR":
            self.i += 1
            right = self._and()
            left = BinOp("or", left, right)
        return left

    def _and(self) -> Node:
        left = self._not()
        while self._peek().kind == "AND":
            self.i += 1
            right = self._not()
            left = BinOp("and", left, right)
        return left

    def _not(self) -> Node:
        if self._peek().kind == "NOT":
            self.i += 1
            return UnaryOp("not", self._not())
        return self._cmp()

    def _cmp(self) -> Node:
        left = self._primary()
        t = self._peek()
        if t.kind in ("==", "!=", "<", "<=", ">", ">="):
            op = t.kind
            self.i += 1
            right = self._primary()
            return BinOp(op, left, right)
        if t.kind == "IN":
            self.i += 1
            right = self._primary()
            return BinOp("in", left, right)
        return left

    def _primary(self) -> Node:
        t = self._peek()
        if t.kind == "TRUE":
            self.i += 1
            return Lit(True)
        if t.kind == "FALSE":
            self.i += 1
            return Lit(False)
        if t.kind == "NULL":
            self.i += 1
            return Lit(None)
        if t.kind in ("INT", "FLOAT", "STRING"):
            self.i += 1
            return Lit(t.value)
        if t.kind == "(":
            self.i += 1
            inner = self._or()
            self._eat(")")
            return inner
        if t.kind == "[":
            self.i += 1
            items: list = []
            if self._peek().kind != "]":
                items.append(self._or())
                while self._peek().kind == ",":
                    self.i += 1
                    items.append(self._or())
            self._eat("]")
            return ListLit(items)
        if t.kind == "IDENT":
            self.i += 1
            node: Node = Ident(t.value)
            while True:
                nt = self._peek()
                if nt.kind == ".":
                    self.i += 1
                    name = self._eat("IDENT").value
                    node = Attr(node, name)
                elif nt.kind == "(":
                    self.i += 1
                    args: list = []
                    if self._peek().kind != ")":
                        args.append(self._or())
                        while self._peek().kind == ",":
                            self.i += 1
                            args.append(self._or())
                    self._eat(")")
                    node = Call(node, args)
                else:
                    break
            return node
        raise PolicyError(f"unexpected token: {t.kind} {t.value!r}")


def parse(src: str) -> Node:
    return _Parser(_tokenize(src)).parse()


def _resolve(ctx: Any, name: str) -> Any:
    if ctx is None:
        return None
    if isinstance(ctx, dict):
        return ctx.get(name)
    return getattr(ctx, name, None)


def evaluate(
    node: Node,
    ctx: dict,
    funcs: dict | None = None,
) -> Any:
    funcs = funcs or {}

    def ev(n: Node) -> Any:
        if isinstance(n, Lit):
            return n.value
        if isinstance(n, Ident):
            if n.name in funcs:
                return funcs[n.name]
            return ctx.get(n.name)
        if isinstance(n, Attr):
            target = ev(n.target)
            return _resolve(target, n.name)
        if isinstance(n, Call):
            if isinstance(n.target, Attr) and n.target.name == "matches":
                subj = ev(n.target.target)
                if subj is None:
                    return False
                pattern = ev(n.args[0])
                return re.search(pattern, str(subj)) is not None
            target = ev(n.target)
            if not callable(target):
                raise PolicyError(f"not callable: {n.target}")
            return target(*(ev(a) for a in n.args))
        if isinstance(n, ListLit):
            return [ev(x) for x in n.items]
        if isinstance(n, UnaryOp):
            return not ev(n.operand)
        if isinstance(n, BinOp):
            if n.op == "and":
                return bool(ev(n.left)) and bool(ev(n.right))
            if n.op == "or":
                return bool(ev(n.left)) or bool(ev(n.right))
            if n.op == "in":
                left = ev(n.left)
                right = ev(n.right)
                if right is None:
                    return False
                return left in right
            left = ev(n.left)
            right = ev(n.right)
            return {
                "==": left == right,
                "!=": left != right,
                "<":  (left is not None and right is not None and left < right),
                "<=": (left is not None and right is not None and left <= right),
                ">":  (left is not None and right is not None and left > right),
                ">=": (left is not None and right is not None and left >= right),
            }[n.op]
        raise PolicyError(f"unknown node: {n!r}")

    return ev(node)
