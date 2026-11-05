"""Model file acquisition.

The model is committed to the repository so clones work offline, but this
safety net downloads it automatically when it is missing (e.g. fresh Docker
images or sparse checkouts).
"""

from __future__ import annotations

import logging
import shutil
import urllib.request
from pathlib import Path

logger = logging.getLogger("fer.model")

CHUNK_SIZE = 1024 * 1024


def ensure_model_file(path: Path, url: str, timeout: int = 60) -> bool:
    """Return True when the model file exists at `path` afterwards.

    Downloads the file atomically (temp file + rename) if it is missing.
    Raises `urllib.error.URLError` / `OSError` on failure.
    """
    path = Path(path)
    if path.is_file() and path.stat().st_size > 0:
        return True

    path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = path.with_suffix(path.suffix + ".part")
    logger.info("Model file missing – downloading from %s", url)

    try:
        with urllib.request.urlopen(url, timeout=timeout) as response:
            total = int(response.headers.get("Content-Length") or 0)
            downloaded = 0
            with open(temp_path, "wb") as handle:
                while True:
                    chunk = response.read(CHUNK_SIZE)
                    if not chunk:
                        break
                    handle.write(chunk)
                    downloaded += len(chunk)
                    if total and logger.isEnabledFor(logging.DEBUG):
                        logger.debug("downloaded %d/%d bytes", downloaded, total)
        shutil.move(str(temp_path), str(path))
    except Exception:
        temp_path.unlink(missing_ok=True)
        raise

    logger.info("Model file ready: %s (%d bytes)", path, path.stat().st_size)
    return True
