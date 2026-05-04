from __future__ import annotations

import logging
from typing import Any

from fastapi import HTTPException


class ErrorHandlingSkill:
    @staticmethod
    def handle(exc: Exception) -> HTTPException:
        if isinstance(exc, HTTPException):
            return exc

        if isinstance(exc, ValueError):
            return HTTPException(status_code=400, detail=str(exc))

        if isinstance(exc, PermissionError):
            return HTTPException(status_code=403, detail=str(exc) or "Not authorized")

        logging.getLogger(__name__).exception("Unhandled route error", exc_info=exc)
        return HTTPException(status_code=500, detail="Internal server error")

    @staticmethod
    def handle_booking_error(error_code: str, context: dict[str, Any] | None = None) -> dict[str, Any]:
        return {"error_code": error_code, "handled": True, "context": context or {}}
