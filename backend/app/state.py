"""Runtime application state.

The model and detector are loaded once during startup and shared by every
request through this module-level registry (thread-safe: sessions are only
read after startup, and the engine serialises inference with a lock).
"""

from __future__ import annotations

from dataclasses import dataclass

from .ml.pipeline import EmotionPipeline


@dataclass
class AppState:
    pipeline: EmotionPipeline | None = None
    error: str | None = None

    @property
    def ready(self) -> bool:
        return self.pipeline is not None


state = AppState()
