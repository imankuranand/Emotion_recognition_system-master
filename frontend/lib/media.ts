/**
 * Media helpers shared by the dashboard modes (webcam / image / video).
 *
 * Everything here runs browser-side and produces JPEG blobs that are sent to
 * the FastAPI backend — no analysis happens locally, so boxes and
 * probabilities always come from the real model.
 */

/** Encode a canvas into a JPEG blob (null when encoding fails). */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality = 0.85,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

/**
 * Grab the current frame of a <video> element as a JPEG.
 *
 * `mirror` flips the pixels horizontally so a front-facing (selfie) preview
 * that is CSS-mirrored stays consistent: the server sees the same orientation
 * the user sees, while overlay labels drawn by `drawDetections` stay upright.
 */
export async function captureFrame(
  video: HTMLVideoElement,
  mirror = false,
  quality = 0.85,
): Promise<Blob | null> {
  const width = video.videoWidth;
  const height = video.videoHeight;
  if (!width || !height) return null;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  if (mirror) {
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, 0, 0, width, height);

  return canvasToBlob(canvas, quality);
}

interface NormalizedImage {
  blob: Blob;
  width: number;
  height: number;
}

/**
 * Decode an image file, downscale it to at most `maxSide` pixels on the long
 * edge and re-encode it as JPEG.
 *
 * Normalising before upload means the preview the user sees is *exactly* the
 * bytes the model analysed, so bounding boxes line up 1:1 regardless of EXIF
 * orientation or source format.
 */
export async function fileToNormalizedJpeg(
  file: File,
  maxSide = 1600,
  quality = 0.9,
): Promise<NormalizedImage> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const img = await loadImage(objectUrl);
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not available in this browser.");
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await canvasToBlob(canvas, quality);
    if (!blob) throw new Error("Could not encode the image.");

    return { blob, width, height };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("The image could not be decoded."));
    img.src = src;
  });
}

/** Seek a paused <video> to `time` seconds and wait for the frame. */
export function seekTo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      video.removeEventListener("seeked", finish);
      resolve();
    };

    // Safety net: some codecs never fire `seeked` on tiny seeks.
    const timer = window.setTimeout(finish, 4_000);
    video.addEventListener("seeked", finish);
    video.currentTime = time;
  });
}

/** 72 → "01:12" */
export function formatTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}
