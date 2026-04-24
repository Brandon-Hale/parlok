from pathlib import Path

from .adapter import Adapter


class Firewall:
    """The orchestrator that evaluates tool calls against policies.

    v0 skeleton: construction works, everything else raises NotImplementedError.
    The real policy engine, YAML loader, and wrap() implementation land in v0.1.
    """

    def __init__(self, config: dict | None = None):
        self._config = config or {}

    @classmethod
    def from_file(cls, path: str | Path) -> "Firewall":
        raise NotImplementedError("YAML loader lands in v0.1")

    def wrap(self, adapter: Adapter) -> Adapter:
        raise NotImplementedError("wrap() lands in v0.1")
