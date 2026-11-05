"""Download the FER+ ONNX model into backend/assets if it is not present.

Usage (from the backend/ directory):
    python scripts/download_model.py

Called automatically by the Docker build and as a fallback at API startup.
"""

from __future__ import annotations

import sys
from pathlib import Path

# Allow running the script directly: `python scripts/download_model.py`
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import MODEL_PATH, MODEL_URL  # noqa: E402
from app.model_fetch import ensure_model_file  # noqa: E402


def main() -> int:
    try:
        ensure_model_file(MODEL_PATH, MODEL_URL)
    except Exception as exc:  # noqa: BLE001
        print(f"[error] could not obtain model: {exc}", file=sys.stderr)
        return 1
    print(f"[ok] model ready at: {MODEL_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
