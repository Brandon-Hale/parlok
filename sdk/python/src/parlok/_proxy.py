from __future__ import annotations

from .adapter import Adapter


class WrappedAdapter:
    """Proxy that forwards calls through the firewall to the adapter's execute."""

    def __init__(self, adapter: Adapter, firewall):
        self._adapter = adapter
        self._firewall = firewall

    def __getattr__(self, method: str):
        if method.startswith("_"):
            raise AttributeError(method)

        async def _call(**kwargs):
            call = self._adapter.normalise(method, kwargs)
            return await self._firewall._dispatch(self._adapter, call)

        return _call
