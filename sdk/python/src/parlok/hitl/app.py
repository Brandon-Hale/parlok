"""Starlette app factory for receiving approval callbacks.

The user mounts this inside their own ASGI service and passes the approver
instance(s) they want routed. Import is lazy so core stays starlette-free.
"""
from __future__ import annotations

from .base import Approver


def approvals_app(approvers: list[Approver]):
    try:
        from starlette.applications import Starlette
        from starlette.responses import JSONResponse
        from starlette.routing import Route
    except ImportError as e:
        raise ImportError(
            "parlok.hitl.app requires starlette; install with `pip install parlok[hitl]`"
        ) from e

    registry: dict[str, Approver] = {a.name: a for a in approvers}

    async def resolve(request):
        data = await request.json()
        target = registry.get(data.get("approver") or "")
        if target is None:
            return JSONResponse({"error": "unknown approver"}, status_code=400)
        target.resolve(  # type: ignore[attr-defined]
            data["pending_id"], data["resolution"],
            data.get("reviewer"), data.get("reason"),
        )
        return JSONResponse({"ok": True})

    return Starlette(routes=[Route("/parlok/approvals", resolve, methods=["POST"])])
