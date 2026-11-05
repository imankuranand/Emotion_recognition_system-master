/**
 * Canvas overlay rendering for detection results.
 *
 * The overlay canvas uses the same natural dimensions as the analysed image
 * (`result.width × result.height`), so API box coordinates map 1:1.
 */

import { emotionColor, titleCase } from "./emotions";
import type { PredictionResponse } from "./types";

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

/** Draw bounding boxes + labels for a prediction onto a cleared canvas. */
export function drawDetections(
  canvas: HTMLCanvasElement,
  result: PredictionResponse,
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = result.width;
  canvas.height = result.height;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const scale = Math.max(result.width, result.height) / 720;
  const lineWidth = Math.max(2, Math.round(2 * scale));
  const fontSize = Math.max(13, Math.round(15 * scale));
  const pad = Math.max(6, Math.round(8 * scale));
  const radius = Math.max(4, Math.round(6 * scale));

  for (const face of result.faces) {
    const [x, y, w, h] = face.box;
    const color = emotionColor(face.emotion);
    const label = `${titleCase(face.emotion)}  ${(face.confidence * 100).toFixed(0)}%`;

    // bounding box
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.95;
    roundedRect(ctx, x, y, w, h, radius);
    ctx.stroke();

    // corner accents
    const corner = Math.min(w, h) * 0.22;
    ctx.globalAlpha = 1;
    ctx.lineWidth = lineWidth * 1.6;
    ctx.beginPath();
    // top-left
    ctx.moveTo(x, y + corner);
    ctx.lineTo(x, y);
    ctx.lineTo(x + corner, y);
    // top-right
    ctx.moveTo(x + w - corner, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + corner);
    // bottom-left
    ctx.moveTo(x, y + h - corner);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x + corner, y + h);
    // bottom-right
    ctx.moveTo(x + w - corner, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w, y + h - corner);
    ctx.stroke();

    // label chip above the box (flip below when near the top edge)
    ctx.font = `600 ${fontSize}px "Space Grotesk", "Inter", sans-serif`;
    const textWidth = ctx.measureText(label).width;
    const chipW = textWidth + pad * 2;
    const chipH = fontSize + pad * 1.4;
    let chipX = x;
    let chipY = y - chipH - pad * 0.6;
    if (chipY < 0) chipY = y + pad * 0.6;
    if (chipX + chipW > canvas.width) chipX = Math.max(0, canvas.width - chipW);

    ctx.globalAlpha = 0.92;
    ctx.fillStyle = "rgba(4, 8, 15, 0.88)";
    roundedRect(ctx, chipX, chipY, chipW, chipH, 4);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, lineWidth * 0.6);
    roundedRect(ctx, chipX, chipY, chipW, chipH, 4);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.textBaseline = "middle";
    ctx.fillText(label, chipX + pad, chipY + chipH / 2 + 0.5);
  }

  ctx.globalAlpha = 1;
}

/** Remove any drawing from the overlay. */
export function clearOverlay(canvas: HTMLCanvasElement | null): void {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
