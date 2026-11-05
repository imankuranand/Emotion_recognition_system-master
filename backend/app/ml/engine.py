"""ONNX Runtime inference engine for the FER+ emotion model.

Key engineering notes
---------------------
* The session is loaded ONCE at startup. The original repository reloaded the
  model graph from disk on every single frame, which made webcam inference
  unusably slow (`label_image.py::load_graph` was called per call).
* Input contract (verified against the actual model file):
    - input  : "Input3"            float32 [1, 1, 64, 64]  (grayscale face crop)
    - output : "Plus692_Output_0"  float32 [1, 8]          (raw scores -> softmax)
"""

from __future__ import annotations

import threading

import cv2
import numpy as np
import onnxruntime as ort

from .emotions import EMOTIONS, INPUT_SIZE

# Pixel value convention fed to the model.
#   "raw"     -> grayscale pixels in [0, 255]  ← VALIDATED CORRECT
#   "zscore"  -> (pixel - 127.5) / 127.5       ← collapses to a constant prior
#
# Evidence (see scripts/validate_model.py):
#   1. Structural: the graph's first ops are Sub(x, 127.5) then Div(x, 255.0),
#      i.e. the network normalises its input internally and therefore expects
#      raw 0-255 grayscale pixels (as stated by the model author in
#      onnx/models PR #139).
#   2. Empirical: across real face frames the "raw" convention produces
#      content-dependent distributions while "zscore" yields near-identical
#      outputs for every input (the sign of a dead input pipeline).
PREPROCESS_MODE = "raw"


def softmax(values: np.ndarray) -> np.ndarray:
    """Numerically stable softmax."""
    shifted = values - np.max(values)
    exp = np.exp(shifted)
    return exp / np.sum(exp)


class EmotionEngine:
    """Wraps a validated ONNX session and exposes `predict(face_bgr)`."""

    def __init__(self, model_path: str) -> None:
        options = ort.SessionOptions()
        options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
        options.intra_op_num_threads = 2  # bounded CPU use on shared hosting

        self._session = ort.InferenceSession(
            model_path,
            sess_options=options,
            providers=["CPUExecutionProvider"],
        )

        model_input = self._session.get_inputs()[0]
        model_output = self._session.get_outputs()[0]
        self._input_name = model_input.name
        self._output_name = model_output.name

        # Fail fast if a different model file was supplied.
        input_shape = model_input.shape
        if list(input_shape) != [1, 1, INPUT_SIZE, INPUT_SIZE]:
            raise ValueError(
                f"Unexpected model input shape {input_shape}, "
                f"expected [1, 1, {INPUT_SIZE}, {INPUT_SIZE}]."
            )
        output_classes = model_output.shape[-1]
        if output_classes not in (None, len(EMOTIONS)):
            raise ValueError(
                f"Model outputs {output_classes} classes, expected {len(EMOTIONS)}."
            )

        self.model_path = model_path
        self._lock = threading.Lock()  # serialises calls from the FastAPI threadpool

    # ------------------------------------------------------------------
    @staticmethod
    def preprocess(face_bgr: np.ndarray) -> np.ndarray:
        """BGR face crop -> float32 tensor [1, 1, 64, 64]."""
        gray = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2GRAY)
        resized = cv2.resize(gray, (INPUT_SIZE, INPUT_SIZE), interpolation=cv2.INTER_AREA)
        tensor = resized.astype(np.float32)
        if PREPROCESS_MODE == "zscore":
            tensor = (tensor - 127.5) / 127.5
        return tensor.reshape(1, 1, INPUT_SIZE, INPUT_SIZE)

    # ------------------------------------------------------------------
    def predict(self, face_bgr: np.ndarray) -> np.ndarray:
        """Return an 8-element probability vector for one face crop."""
        if face_bgr.size == 0:
            raise ValueError("Empty face crop supplied to the emotion engine.")
        tensor = self.preprocess(face_bgr)
        with self._lock:
            scores = self._session.run(
                [self._output_name], {self._input_name: tensor}
            )[0]
        return softmax(np.asarray(scores, dtype=np.float64).reshape(-1))

    @property
    def classes(self) -> list[str]:
        return list(EMOTIONS)
