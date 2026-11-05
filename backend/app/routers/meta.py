"""Health and model metadata endpoints."""

from __future__ import annotations

from fastapi import APIRouter

from ..config import APP_VERSION, ALLOWED_ORIGINS
from ..ml.emotions import (
    EMOTIONS,
    INPUT_SIZE,
    MODEL_FULL_NAME,
    MODEL_NAME,
    MODEL_PAPER,
    MODEL_SOURCE,
)
from ..schemas import HealthResponse, ModelInfoResponse
from ..state import state

router = APIRouter(prefix="/api", tags=["meta"])


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    """Liveness/readiness probe used by the frontend and by uptime monitors."""
    return HealthResponse(
        status="ok" if state.ready else "degraded",
        model_loaded=state.ready,
        detector_loaded=state.ready,
        model=MODEL_NAME,
        classes=list(EMOTIONS),
        version=APP_VERSION,
    )


@router.get("/model", response_model=ModelInfoResponse)
def model_info() -> ModelInfoResponse:
    """Describes the exact model that is serving predictions (no guesswork)."""
    return ModelInfoResponse(
        model=MODEL_NAME,
        full_name=MODEL_FULL_NAME,
        source=MODEL_SOURCE,
        paper=MODEL_PAPER,
        classes=list(EMOTIONS),
        input_size=INPUT_SIZE,
        preprocess="64x64 grayscale, float32",
        face_detector="OpenCV Haar cascade (frontal face default)",
        framework="ONNX Runtime",
    )


@router.get("/config")
def public_config() -> dict:
    """Non-sensitive runtime configuration consumed by the frontend."""
    return {"allowed_origins": ALLOWED_ORIGINS, "version": APP_VERSION}
