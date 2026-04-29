from typing import Any


class ErrorHandlingSkill:
    @staticmethod
    def handle_booking_error(error_code: str, context: dict[str, Any] | None = None) -> dict[str, Any]:
        return {"error_code": error_code, "handled": True, "context": context or {}}
