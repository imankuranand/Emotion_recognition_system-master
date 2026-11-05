"""FastAPI entry point for the Facial Emotion Recognition backend.

Run locally:
    uvicorn app.main:app --reload --port 8000     (from the backend/ folder)

The ML assets are loaded exactly once during startup; individual requests
only touch the already-initialised sessions.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import (
    ALLOWED_ORIGINS,
    APP_NAME,
    APP_VERSION,
    CASCADE_PATH,
    MODEL_PATH,
    MODEL_URL,
)
from .ml.detector import FaceDetector
from .ml.engine import EmotionEngine
from .ml.pipeline import EmotionPipeline
from .model_fetch import ensure_model_file
from .routers import meta, predict
from .state import state

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger("fer.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load cascade + ONNX model once, then serve requests."""
    try:
        ensure_model_file(MODEL_PATH, MODEL_URL)
        detector = FaceDetector(str(CASCADE_PATH))
        engine = EmotionEngine(str(MODEL_PATH))
        state.pipeline = EmotionPipeline(detector, engine)
        state.error = None
        logger.info("Model '%s' ready (classes: %s)", MODEL_PATH.name, engine.classes)
    except Exception as exc:  # noqa: BLE001 – surface any startup failure
        state.pipeline = None
        state.error = f"{type(exc).__name__}: {exc}"
        logger.exception("Startup failed – API will answer 503 on /api/predict")
    yield
    state.pipeline = None


app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description=(
        "Face detection (OpenCV Haar cascade) + FER+ emotion classification "
        "(ONNX Runtime). Serves the web frontend and any other API clients."
    ),
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(meta.router)
app.include_router(predict.router)


@app.get("/", tags=["meta"])
def root() -> dict:
    """Service banner – handy when opening the deployed URL directly."""
    return {
        "name": APP_NAME,
        "version": APP_VERSION,
        "status": "ok" if state.ready else "degraded",
        "docs": "/docs",
        "health": "/api/health",
    }
