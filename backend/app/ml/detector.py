"""Face detection with OpenCV Haar cascades.

This module keeps the detection strategy of the original repository
(`recognition_webcam.py`): detection runs on an image downscaled by a fixed
factor for speed, then the bounding boxes are scaled back to the original
resolution. Minor robustness improvements (grayscale conversion, minimum
neighbour/size thresholds, box clipping) were added and are documented.
"""

from __future__ import annotations

from dataclasses import dataclass

import cv2
import numpy as np

from ..config import DETECT_DOWNSCALE, DETECT_MIN_NEIGHBORS, MAX_FACES_PER_IMAGE


@dataclass(frozen=True)
class FaceBox:
    """Axis-aligned face bounding box in original image coordinates."""

    x: int
    y: int
    w: int
    h: int

    @property
    def area(self) -> int:
        return self.w * self.h

    def as_tuple(self) -> tuple[int, int, int, int]:
        return (self.x, self.y, self.w, self.h)


class FaceDetector:
    """Loads a Haar cascade once and reuses it for every request."""

    def __init__(self, cascade_path: str, downscale: int = DETECT_DOWNSCALE) -> None:
        self._cascade = cv2.CascadeClassifier(cascade_path)
        if self._cascade.empty():
            raise FileNotFoundError(
                f"Haar cascade could not be loaded from '{cascade_path}'."
            )
        self._downscale = max(1, downscale)

    def detect(self, image_bgr: np.ndarray) -> list[FaceBox]:
        """Return face boxes (x, y, w, h) in original image coordinates."""
        height, width = image_bgr.shape[:2]

        # Detect on a downscaled grayscale image (faster, same as original code).
        mini_width = max(1, width // self._downscale)
        mini_height = max(1, height // self._downscale)
        mini = cv2.resize(image_bgr, (mini_width, mini_height))
        gray = cv2.cvtColor(mini, cv2.COLOR_BGR2GRAY)
        gray = cv2.equalizeHist(gray)

        raw_faces = self._cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=DETECT_MIN_NEIGHBORS,
            minSize=(24, 24),
        )

        faces: list[FaceBox] = []
        for (x, y, w, h) in raw_faces:
            x0 = int(x) * self._downscale
            y0 = int(y) * self._downscale
            w0 = int(w) * self._downscale
            h0 = int(h) * self._downscale

            # Clip to image bounds.
            x0 = max(0, min(x0, width - 1))
            y0 = max(0, min(y0, height - 1))
            w0 = max(1, min(w0, width - x0))
            h0 = max(1, min(h0, height - y0))

            if w0 >= 24 and h0 >= 24:
                faces.append(FaceBox(x=x0, y=y0, w=w0, h=h0))

        # Biggest faces first, bounded to keep inference latency predictable.
        faces.sort(key=lambda box: box.area, reverse=True)
        return faces[:MAX_FACES_PER_IMAGE]
