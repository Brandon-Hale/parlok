from dataclasses import dataclass, field
from typing import Any


@dataclass
class ToolCall:
    """Normalised representation of a single agent tool call.

    Every adapter converts its native call shape into one of these so that
    policies can be written against a single schema regardless of adapter.
    """

    adapter: str
    action: str
    recipient: str | None = None
    body: str | None = None
    subject: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)
