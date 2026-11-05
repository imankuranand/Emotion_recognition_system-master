"""End-to-end analysis pipeline: decode -> detect faces -> classify emotions.

Kept separate from the FastAPI layer so it can be unit tested and reused
(e.g. by a future batch/video worker).
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field

import numpy as np

from .detector import FaceBox, FaceDetector
from .emotions import EMOTIONS
from .engine import EmotionEngine


@dataclass
class FaceResult:
    """Classification result for a single detected face."""

    box: FaceBox
    emotion: str
    confidence: float
    probabilities: dict[str, float]
    # stable index of the winning class (0..7) – handy for analytics
    emotion_index: int = field(default=0)


@dataclass
class AnalysisResult:
    """Full result for one image."""

    faces: list[FaceResult]
    width: int
    height: int
    detection_ms: float
    inference_ms: float

    @property
    def face_count(self) -> int:
        return len(self.faces)

    @property
    def dominant_face(self) -> FaceResult | None:
        """Highest-confidence face – drives the headline emotion."""
        if not self.faces:
            return None
        return max(self.faces, key=lambda f: f.confidence)


class EmotionPipeline:
    def __init__(self, detector: FaceDetector, engine: EmotionEngine) -> None:
        self.detector = detector
        self.engine = engine

    def analyze(self, image_bgr: np.ndarray) -> AnalysisResult:
        height, width = image_bgr.shape[:2]

        start = time.perf_counter()
        faces = self.detector.detect(image_bgr)
        detection_ms = (time.perf_counter() - start) * 1000.0

        results: list[FaceResult] = []
        start = time.perf_counter()
        for box in faces:
            crop = image_bgr[box.y : box.y + box.h, box.x : box.x + box.w]
            probabilities = self.engine.predict(crop)
            emotion_index = int(np.argmax(probabilities))
            results.append(
                FaceResult(
                    box=box,
                    emotion=EMOTIONS[emotion_index],
                    confidence=float(probabilities[emotion_index]),
                    probabilities={
                        label: float(probabilities[index])
                        for index, label in enumerate(EMOTIONS)
                    },
                    emotion_index=emotion_index,
                )
            )
        inference_ms = (time.perf_counter() - start) * 1000.0

        return AnalysisResult(
            faces=results,
            width=width,
            height=height,
            detection_ms=detection_ms,
            inference_ms=inference_ms,
        )
