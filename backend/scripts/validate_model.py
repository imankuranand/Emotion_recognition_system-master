"""Empirical validation of the preprocessing convention.

Compares the two candidate input conventions ("raw" 0-255 vs "zscore"
(x-127.5)/127.5) on real face crops. The graph itself settles the question:
the first ops are  Sub(x, 127.5) / Div(x, 255.0), i.e. the model normalises
internally and therefore expects raw grayscale pixels.

Usage (from backend/):
    python scripts/validate_model.py image1.jpg image2.jpg ...
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import cv2
import numpy as np

from app.config import CASCADE_PATH, MODEL_PATH
from app.ml.emotions import EMOTIONS, INPUT_SIZE
from app.ml.engine import EmotionEngine, softmax


def make_tensor(face_bgr: np.ndarray, mode: str) -> np.ndarray:
    gray = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2GRAY)
    resized = cv2.resize(gray, (INPUT_SIZE, INPUT_SIZE), interpolation=cv2.INTER_AREA)
    tensor = resized.astype(np.float32)
    if mode == "zscore":
        tensor = (tensor - 127.5) / 127.5
    return tensor.reshape(1, 1, INPUT_SIZE, INPUT_SIZE)


def main(paths: list[str]) -> int:
    from app.ml.detector import FaceDetector

    detector = FaceDetector(str(CASCADE_PATH))
    engine = EmotionEngine(str(MODEL_PATH))

    for image_path in paths:
        image = cv2.imread(image_path)
        if image is None:
            print(f"[skip] cannot read {image_path}")
            continue
        faces = detector.detect(image)
        print(f"\n== {Path(image_path).name} | {len(faces)} face(s) ==")
        for index, box in enumerate(faces, start=1):
            crop = image[box.y : box.y + box.h, box.x : box.x + box.w]
            for mode in ("raw", "zscore"):
                scores = engine._session.run(  # noqa: SLF001 – deliberate
                    [engine._output_name],
                    {engine._input_name: make_tensor(crop, mode)},
                )[0]
                probs = softmax(np.asarray(scores, dtype=np.float64).reshape(-1))
                top = np.argsort(probs)[::-1][:3]
                ranked = ", ".join(
                    f"{EMOTIONS[i]}={probs[i] * 100:5.1f}%" for i in top
                )
                print(f"  face {index} [{mode:6s}] {ranked}")
    return 0


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("usage: python scripts/validate_model.py <image> [<image> ...]")
        raise SystemExit(2)
    raise SystemExit(main(sys.argv[1:]))
