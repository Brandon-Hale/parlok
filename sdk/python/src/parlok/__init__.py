from importlib.metadata import PackageNotFoundError, version as _pkg_version

from .adapter import Adapter
from .decision import Decision, DecisionKind
from .firewall import Firewall
from .toolcall import ToolCall

__all__ = ["Adapter", "ToolCall", "Decision", "DecisionKind", "Firewall"]

try:
    __version__ = _pkg_version("parlok")
except PackageNotFoundError:
    __version__ = "0.0.0+unknown"
