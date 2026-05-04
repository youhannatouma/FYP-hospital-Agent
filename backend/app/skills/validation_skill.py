from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ValidationError
import logging

log = logging.getLogger(__name__)

class ValidationSkill:
    """
    Purpose:
    Ensure all inputs and operations are valid before execution.
    """

    @staticmethod
    def validate_input(schema: Any, data: Dict[str, Any]) -> Any:
        """
        Input validation (schema-based).
        Returns the validated model or raises ValueError.
        """
        try:
            if isinstance(schema, type) and issubclass(schema, BaseModel):
                return schema(**data)
            return data
        except ValidationError as e:
            log.warning(f"ValidationSkill: Schema validation failed: {e}")
            raise ValueError(f"Invalid input data: {e.errors()}")

    @staticmethod
    def validate_business_rule(condition: bool, error_message: str):
        """
        Business rule validation.
        Prevents invalid or conflicting operations.
        """
        if not condition:
            log.warning(f"ValidationSkill: Business rule violation: {error_message}")
            raise ValueError(error_message)

    @staticmethod
    def ensure_exists(entity: Any, entity_name: str = "Resource"):
        """
        Ensures a database entity exists.
        """
        if not entity:
            log.warning(f"ValidationSkill: {entity_name} not found")
            raise ValueError(f"{entity_name} not found")
        return entity
