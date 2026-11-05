"""Application configuration.

Every value can be overridden through environment variables so that no
credentials or machine-specific paths are ever hardcoded (deployment ready).
"""

from __future__ import annotations

import os
from pathlib import Path

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
ASSETS_DIR = Path(os.getenv("ASSETS_DIR", str(BASE_DIR / "assets")))

MODEL_PATH = Path(os.getenv("MODEL_PATH", str(ASSETS_DIR / "emotion-ferplus-8.onnx")))
CASCADE_PATH = Path(
    os.getenv("CASCADE_PATH", str(ASSETS_DIR / "haarcascade_frontalface_default.xml"))
)

# Used only if the model file is missing at startup (see scripts/download_model.py).
MODEL_URL = os.getenv(
    "MODEL_URL",
    "https://huggingface.co/onnxmodelzoo/emotion-ferplus-8/resolve/main/emotion-ferplus-8.onnx",
)

# ---------------------------------------------------------------------------
# API / CORS
# ---------------------------------------------------------------------------
# Comma separated list of allowed origins, e.g.
#   ALLOWED_ORIGINS="https://my-app.vercel.app,http://localhost:3000"
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "*").split(",")
    if origin.strip()
]

# ---------------------------------------------------------------------------
# Request validation
# ---------------------------------------------------------------------------
MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", str(10 * 1024 * 1024)))  # 10 MB
ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/bmp",
}

# ---------------------------------------------------------------------------
# Detection / inference tuning
# ---------------------------------------------------------------------------
# The original repository detects faces on an image downscaled by 4 for speed
# and scales the boxes back up afterwards. That behaviour is preserved.
DETECT_DOWNSCALE = int(os.getenv("DETECT_DOWNSCALE", "4"))
DETECT_MIN_NEIGHBORS = int(os.getenv("DETECT_MIN_NEIGHBORS", "5"))
MAX_FACES_PER_IMAGE = int(os.getenv("MAX_FACES_PER_IMAGE", "8"))

APP_NAME = "Facial Emotion Recognition API"
APP_VERSION = "1.0.0"
