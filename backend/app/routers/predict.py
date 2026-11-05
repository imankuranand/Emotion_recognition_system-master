"""Image upload -> face detection -> emotion classification endpoint."""

from __future__ import annotations

import cv2
import numpy as np
from fastapi import APIRouter, File, HTTPException, UploadFile

from ..config import ALLOWED_CONTENT_TYPES, MAX_UPLOAD_BYTES
from ..ml.emotions import MODEL_NAME
from ..schemas import FacePrediction, PredictionResponse
from ..state import state

router = APIRouter(prefix="/api", tags=["prediction"])


def _decode_image(data: bytes) -> np.ndarray | None:
    """Decode encoded image bytes into a BGR matrix (None when invalid)."""
    buffer = np.frombuffer(data, dtype=np.uint8)
    return cv2.imdecode(buffer, cv2.IMREAD_COLOR)


@router.post(
    "/predict",
    response_model=PredictionResponse,
    summary="Analyze an image and classify the emotion of every detected face",
)
def predict(file: UploadFile = File(...)) -> PredictionResponse:
    # 1. Service readiness ---------------------------------------------
    if not state.ready or state.pipeline is None:
        raise HTTPException(
            status_code=503,
            detail=state.error or "Inference service is not ready yet.",
        )

    # 2. Input validation ----------------------------------------------
    content_type = (file.content_type or "").split(";")[0].strip().lower()
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported media type '{content_type}'. "
            f"Allowed: {sorted(ALLOWED_CONTENT_TYPES)}.",
        )

    data = file.file.read(MAX_UPLOAD_BYTES + 1)
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"Image exceeds the {MAX_UPLOAD_BYTES // (1024 * 1024)} MB limit.",
        )
    if not data:
        raise HTTPException(status_code=422, detail="The uploaded file is empty.")

    image = _decode_image(data)
    if image is None:
        raise HTTPException(
            status_code=422,
            detail="The file could not be decoded as an image.",
        )

    # 3. Inference (runs in FastAPI's worker threadpool) ----------------
    result = state.pipeline.analyze(image)

    faces = [
        FacePrediction(
            box=face.box.as_tuple(),
            emotion=face.emotion,
            confidence=round(face.confidence, 6),
            emotion_index=face.emotion_index,
            probabilities={k: round(v, 6) for k, v in face.probabilities.items()},
        )
        for face in result.faces
    ]

    return PredictionResponse(
        status="ok" if faces else "no_face",
        face_count=len(faces),
        faces=faces,
        width=result.width,
        height=result.height,
        detection_ms=round(result.detection_ms, 2),
        inference_ms=round(result.inference_ms, 2),
        model=MODEL_NAME,
    )
