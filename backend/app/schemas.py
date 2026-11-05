"""Pydantic request/response schemas – the single source of truth for the
JSON contract shared with the frontend (`frontend/lib/types.ts`)."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class FacePrediction(BaseModel):
    """Emotion prediction for one detected face."""

    # x, y, w, h in original image pixel coordinates
    box: tuple[int, int, int, int]
    emotion: str
    confidence: float = Field(ge=0.0, le=1.0, description="Confidence of the winning class")
    emotion_index: int = Field(ge=0, le=7)
    probabilities: dict[str, float] = Field(
        description="Full softmax distribution over all emotion classes"
    )


class PredictionResponse(BaseModel):
    status: Literal["ok", "no_face"]
    face_count: int
    faces: list[FacePrediction]
    # Pixel size of the processed image – lets the frontend map boxes onto
    # its canvas even when it uploaded a scaled/rotated copy.
    width: int
    height: int
    detection_ms: float
    inference_ms: float
    model: str


class HealthResponse(BaseModel):
    status: Literal["ok", "degraded"]
    model_loaded: bool
    detector_loaded: bool
    model: str
    classes: list[str]
    version: str


class ModelInfoResponse(BaseModel):
    model: str
    full_name: str
    source: str
    paper: str
    classes: list[str]
    input_size: int
    preprocess: str
    face_detector: str
    framework: str
