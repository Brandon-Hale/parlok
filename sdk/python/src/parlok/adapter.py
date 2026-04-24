from abc import ABC, abstractmethod

from .decision import Decision
from .toolcall import ToolCall


class Adapter(ABC):
    """Base class every integration adapter implements.

    An adapter wraps one external SDK (Slack, Resend, Twilio, etc.), converts
    its calls into a normalised ``ToolCall`` (``normalise``), and enacts the
    policy decision against the underlying SDK (``execute``).
    """

    name: str

    @abstractmethod
    def normalise(self, method: str, kwargs: dict) -> ToolCall:
        """Convert an adapter-specific call shape into a ToolCall."""

    @abstractmethod
    async def execute(self, call: ToolCall, decision: Decision):
        """Enact the decision against the real underlying SDK."""
