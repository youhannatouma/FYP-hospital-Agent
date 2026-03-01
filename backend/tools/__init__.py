"""External Tool Integrations Package.

This package contains integrations with external data sources and APIs:

- medication_tools.py: Drug information queries using PostgreSQL + SQLAlchemy

Future additions will include appointment scheduling, provider search, and more.
"""

from .medication_tools import (
    medication_search,
    medication_detail,
)

__all__ = [
    "medication_search",
    "medication_detail",
]
