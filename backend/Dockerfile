# AFFECTRA backend — FastAPI + ONNX Runtime face/emotion API.
# Build context is the backend/ folder (see render.yaml: dockerContext).
FROM python:3.12-slim

# Never buffer output, don't write .pyc into the image.
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /srv

# System libs required by opencv-python-headless + onnxruntime wheels.
RUN apt-get update \
    && apt-get install -y --no-install-recommends libglib2.0-0 libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --r requirements.txt

# Application code + committed ML assets (35 MB model, Haar cascade).
COPY app ./app
COPY assets ./assets
COPY scripts ./scripts

# Render (and most hosts) inject $PORT; default to 8000 for bare docker runs.
ENV PORT=8000
EXPOSE 8000

# 0.0.0.0 so the container is reachable from outside.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
