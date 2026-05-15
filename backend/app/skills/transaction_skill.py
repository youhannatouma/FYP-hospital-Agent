from contextlib import contextmanager
from sqlalchemy.orm import Session
import logging

log = logging.getLogger(__name__)

class TransactionSkill:
    @staticmethod
    @contextmanager
    def run_transaction(db: Session):
        """
        Context manager for handling database transactions.
        Commits on success, rolls back on error.
        """
        try:
            yield db
            db.commit()
        except Exception as e:
            db.rollback()
            log.error(f"Transaction failed, rolled back: {e}")
            raise
