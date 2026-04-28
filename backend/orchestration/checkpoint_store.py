from __future__ import annotations

import asyncio
import logging
import os
from collections.abc import Iterator, Sequence
from typing import Any

from langchain_core.runnables import RunnableConfig
from langgraph.checkpoint.base import (
    BaseCheckpointSaver,
    ChannelVersions,
    Checkpoint,
    CheckpointMetadata,
    CheckpointTuple,
    WRITES_IDX_MAP,
    get_checkpoint_metadata,
)
from langgraph.checkpoint.memory import MemorySaver
from sqlalchemy import desc
from sqlalchemy.orm import Session, sessionmaker

from app.database import SessionLocal
from app.models.langgraph_checkpoint import (
    LangGraphCheckpoint,
    LangGraphCheckpointBlob,
    LangGraphCheckpointWrite,
)

log = logging.getLogger(__name__)


class SqlCheckpointSaver(BaseCheckpointSaver[str]):
    def __init__(self, session_factory: sessionmaker | None = None):
        super().__init__()
        self._session_factory = session_factory or SessionLocal

    def _session(self) -> Session:
        return self._session_factory()

    def get_tuple(self, config: RunnableConfig) -> CheckpointTuple | None:
        thread_id = config["configurable"]["thread_id"]
        checkpoint_ns = config["configurable"].get("checkpoint_ns", "")
        checkpoint_id = config["configurable"].get("checkpoint_id")

        with self._session() as db:
            query = db.query(LangGraphCheckpoint).filter(
                LangGraphCheckpoint.thread_id == thread_id,
                LangGraphCheckpoint.checkpoint_ns == checkpoint_ns,
            )
            if checkpoint_id:
                record = query.filter(
                    LangGraphCheckpoint.checkpoint_id == checkpoint_id
                ).first()
            else:
                record = query.order_by(desc(LangGraphCheckpoint.created_at)).first()

            if not record:
                return None

            checkpoint = self.serde.loads_typed(
                (record.checkpoint_type, record.checkpoint_blob)
            )
            metadata = self.serde.loads_typed(
                (record.metadata_type, record.metadata_blob)
            )

            versions = checkpoint.get("channel_versions", {})
            channel_values: dict[str, Any] = {}
            if versions:
                blob_rows = (
                    db.query(LangGraphCheckpointBlob)
                    .filter(
                        LangGraphCheckpointBlob.thread_id == thread_id,
                        LangGraphCheckpointBlob.checkpoint_ns == checkpoint_ns,
                    )
                    .all()
                )
                blob_map = {
                    (b.channel, b.version): b for b in blob_rows
                }
                for channel, version in versions.items():
                    blob = blob_map.get((channel, str(version)))
                    if not blob:
                        continue
                    if blob.blob_type != "empty":
                        channel_values[channel] = self.serde.loads_typed(
                            (blob.blob_type, blob.blob)
                        )
            checkpoint["channel_values"] = channel_values

            write_rows = (
                db.query(LangGraphCheckpointWrite)
                .filter(
                    LangGraphCheckpointWrite.thread_id == thread_id,
                    LangGraphCheckpointWrite.checkpoint_ns == checkpoint_ns,
                    LangGraphCheckpointWrite.checkpoint_id == record.checkpoint_id,
                )
                .all()
            )
            pending_writes = [
                (w.task_id, w.channel, self.serde.loads_typed((w.value_type, w.value_blob)))
                for w in write_rows
            ]

            parent_config = None
            if record.parent_checkpoint_id:
                parent_config = {
                    "configurable": {
                        "thread_id": thread_id,
                        "checkpoint_ns": checkpoint_ns,
                        "checkpoint_id": record.parent_checkpoint_id,
                    }
                }

            return CheckpointTuple(
                config={
                    "configurable": {
                        "thread_id": thread_id,
                        "checkpoint_ns": checkpoint_ns,
                        "checkpoint_id": record.checkpoint_id,
                    }
                },
                checkpoint=checkpoint,
                metadata=metadata,
                parent_config=parent_config,
                pending_writes=pending_writes,
            )

    def list(
        self,
        config: RunnableConfig | None,
        *,
        filter: dict[str, Any] | None = None,
        before: RunnableConfig | None = None,
        limit: int | None = None,
    ) -> Iterator[CheckpointTuple]:
        if not config:
            return iter(())

        thread_id = config["configurable"]["thread_id"]
        checkpoint_ns = config["configurable"].get("checkpoint_ns", "")

        with self._session() as db:
            query = db.query(LangGraphCheckpoint).filter(
                LangGraphCheckpoint.thread_id == thread_id,
                LangGraphCheckpoint.checkpoint_ns == checkpoint_ns,
            )
            if before:
                before_id = before.get("configurable", {}).get("checkpoint_id")
                if before_id:
                    query = query.filter(LangGraphCheckpoint.checkpoint_id < before_id)
            query = query.order_by(desc(LangGraphCheckpoint.created_at))
            if limit:
                query = query.limit(limit)

            for record in query.all():
                tuple_config = {
                    "configurable": {
                        "thread_id": record.thread_id,
                        "checkpoint_ns": record.checkpoint_ns,
                        "checkpoint_id": record.checkpoint_id,
                    }
                }
                item = self.get_tuple(tuple_config)
                if item:
                    yield item

    def put(
        self,
        config: RunnableConfig,
        checkpoint: Checkpoint,
        metadata: CheckpointMetadata,
        new_versions: ChannelVersions,
    ) -> RunnableConfig:
        thread_id = config["configurable"]["thread_id"]
        checkpoint_ns = config["configurable"].get("checkpoint_ns", "")
        parent_checkpoint_id = config["configurable"].get("checkpoint_id")

        values: dict[str, Any] = checkpoint.get("channel_values", {})
        checkpoint_copy = checkpoint.copy()
        checkpoint_copy.pop("channel_values", None)

        checkpoint_type, checkpoint_blob = self.serde.dumps_typed(checkpoint_copy)
        metadata_type, metadata_blob = self.serde.dumps_typed(
            get_checkpoint_metadata(config, metadata)
        )

        with self._session() as db:
            for channel, version in new_versions.items():
                value = values.get(channel)
                if value is None:
                    blob_type, blob = "empty", b""
                else:
                    blob_type, blob = self.serde.dumps_typed(value)

                existing_blob = (
                    db.query(LangGraphCheckpointBlob)
                    .filter(
                        LangGraphCheckpointBlob.thread_id == thread_id,
                        LangGraphCheckpointBlob.checkpoint_ns == checkpoint_ns,
                        LangGraphCheckpointBlob.channel == channel,
                        LangGraphCheckpointBlob.version == str(version),
                    )
                    .first()
                )
                if existing_blob:
                    existing_blob.blob_type = blob_type
                    existing_blob.blob = blob
                else:
                    db.add(
                        LangGraphCheckpointBlob(
                            thread_id=thread_id,
                            checkpoint_ns=checkpoint_ns,
                            channel=channel,
                            version=str(version),
                            blob_type=blob_type,
                            blob=blob,
                        )
                    )

            record = (
                db.query(LangGraphCheckpoint)
                .filter(
                    LangGraphCheckpoint.thread_id == thread_id,
                    LangGraphCheckpoint.checkpoint_ns == checkpoint_ns,
                    LangGraphCheckpoint.checkpoint_id == checkpoint["id"],
                )
                .first()
            )

            if record:
                record.parent_checkpoint_id = parent_checkpoint_id
                record.checkpoint_type = checkpoint_type
                record.checkpoint_blob = checkpoint_blob
                record.metadata_type = metadata_type
                record.metadata_blob = metadata_blob
            else:
                db.add(
                    LangGraphCheckpoint(
                        thread_id=thread_id,
                        checkpoint_ns=checkpoint_ns,
                        checkpoint_id=checkpoint["id"],
                        parent_checkpoint_id=parent_checkpoint_id,
                        checkpoint_type=checkpoint_type,
                        checkpoint_blob=checkpoint_blob,
                        metadata_type=metadata_type,
                        metadata_blob=metadata_blob,
                    )
                )

            db.commit()

        return {
            "configurable": {
                "thread_id": thread_id,
                "checkpoint_ns": checkpoint_ns,
                "checkpoint_id": checkpoint["id"],
            }
        }

    def put_writes(
        self,
        config: RunnableConfig,
        writes: Sequence[tuple[str, Any]],
        task_id: str,
        task_path: str = "",
    ) -> None:
        thread_id = config["configurable"]["thread_id"]
        checkpoint_ns = config["configurable"].get("checkpoint_ns", "")
        checkpoint_id = config["configurable"]["checkpoint_id"]

        with self._session() as db:
            for idx, (channel, value) in enumerate(writes):
                write_idx = WRITES_IDX_MAP.get(channel, idx)
                if write_idx < 0:
                    continue

                existing = (
                    db.query(LangGraphCheckpointWrite)
                    .filter(
                        LangGraphCheckpointWrite.thread_id == thread_id,
                        LangGraphCheckpointWrite.checkpoint_ns == checkpoint_ns,
                        LangGraphCheckpointWrite.checkpoint_id == checkpoint_id,
                        LangGraphCheckpointWrite.task_id == task_id,
                        LangGraphCheckpointWrite.write_idx == str(write_idx),
                    )
                    .first()
                )
                if existing:
                    continue

                value_type, value_blob = self.serde.dumps_typed(value)
                db.add(
                    LangGraphCheckpointWrite(
                        thread_id=thread_id,
                        checkpoint_ns=checkpoint_ns,
                        checkpoint_id=checkpoint_id,
                        task_id=task_id,
                        write_idx=str(write_idx),
                        channel=channel,
                        value_type=value_type,
                        value_blob=value_blob,
                        task_path=task_path,
                    )
                )
            db.commit()

    def delete_thread(self, thread_id: str) -> None:
        with self._session() as db:
            db.query(LangGraphCheckpointWrite).filter(
                LangGraphCheckpointWrite.thread_id == thread_id
            ).delete()
            db.query(LangGraphCheckpointBlob).filter(
                LangGraphCheckpointBlob.thread_id == thread_id
            ).delete()
            db.query(LangGraphCheckpoint).filter(
                LangGraphCheckpoint.thread_id == thread_id
            ).delete()
            db.commit()

    async def aget_tuple(self, config: RunnableConfig) -> CheckpointTuple | None:
        return await asyncio.to_thread(self.get_tuple, config)

    async def alist(
        self,
        config: RunnableConfig | None,
        *,
        filter: dict[str, Any] | None = None,
        before: RunnableConfig | None = None,
        limit: int | None = None,
    ) -> Any:
        for item in self.list(config, filter=filter, before=before, limit=limit):
            yield item

    async def aput(
        self,
        config: RunnableConfig,
        checkpoint: Checkpoint,
        metadata: CheckpointMetadata,
        new_versions: ChannelVersions,
    ) -> RunnableConfig:
        return await asyncio.to_thread(self.put, config, checkpoint, metadata, new_versions)

    async def aput_writes(
        self,
        config: RunnableConfig,
        writes: Sequence[tuple[str, Any]],
        task_id: str,
        task_path: str = "",
    ) -> None:
        await asyncio.to_thread(self.put_writes, config, writes, task_id, task_path)

    async def adelete_thread(self, thread_id: str) -> None:
        await asyncio.to_thread(self.delete_thread, thread_id)


def get_checkpoint_saver() -> BaseCheckpointSaver[str]:
    flag = os.getenv("LANGGRAPH_CHECKPOINT_PERSISTENT", "true").lower()
    if flag in {"true", "1", "yes"}:
        log.info("Using SQL checkpoint saver for LangGraph.")
        return SqlCheckpointSaver()

    log.info("Using in-memory checkpoint saver for LangGraph.")
    return MemorySaver()
