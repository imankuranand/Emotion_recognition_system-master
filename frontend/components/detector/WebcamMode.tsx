"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  CircleX,
  LoaderCircle,
  Play,
  Square,
  SwitchCamera,
} from "lucide-react";

import { describeError, predictImage } from "@/lib/api";
import { clearOverlay, drawDetections } from "@/lib/draw";
import { captureFrame } from "@/lib/media";
import { btnGhost, btnPrimary } from "@/lib/ui";
import type { ModeProps } from "./shared";

type Facing = "user" | "environment";

/** Frame interval of the analysis loop (ms) ≈ 1.5 inferences per second. */
const FRAME_INTERVAL_MS = 650;

function cameraErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    switch (error.name) {
      case "NotAllowedError":
      case "SecurityError":
        return "Camera permission was denied. Allow camera access for this site and press Start again.";
      case "NotFoundError":
      case "OverconstrainedError":
        return "No camera matching the requested settings was found on this device.";
      case "NotReadableError":
        return "The camera is already in use by another application.";
      default:
        break;
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return "Could not start the camera.";
}

export function WebcamMode({ onResult, onBusyChange, onError, onReset }: ModeProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const busyRef = useRef(false);
  const activeRef = useRef(false);
  const facingRef = useRef<Facing>("user");

  const [live, setLive] = useState(false);
  const [starting, setStarting] = useState(false);
  const [facing, setFacing] = useState<Facing>("user");
  const [hint, setHint] = useState<string | null>(null);

  /** Stop the loop and release the camera. Safe to call any time. */
  const stop = useCallback(() => {
    activeRef.current = false;
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const stream = streamRef.current;
    streamRef.current = null;
    if (stream) {
      for (const track of stream.getTracks()) track.stop();
    }
    const video = videoRef.current;
    if (video) video.srcObject = null;
    busyRef.current = false;
    setLive(false);
    clearOverlay(overlayRef.current);
  }, []);

  // Release the camera when the component unmounts (mode switch / navigation).
  useEffect(() => stop, [stop]);

  /** One tick of the analysis loop. Skips frames while a request is in flight. */
  const tick = useCallback(async () => {
    if (!activeRef.current || busyRef.current) return;
    busyRef.current = true;
    onBusyChange(true);

    try {
      const video = videoRef.current;
      if (!video) return;

      // Front camera: mirror the pixels we send so they match the mirrored
      // on-screen preview; labels drawn on the overlay stay upright.
      const blob = await captureFrame(video, facingRef.current === "user");
      if (!blob || !activeRef.current) return;

      const result = await predictImage(blob, "webcam-frame.jpg", 15_000);
      if (!activeRef.current) return;

      const overlay = overlayRef.current;
      if (overlay) drawDetections(overlay, result);
      onResult(result);
    } catch (error) {
      if (activeRef.current) {
        stop();
        onError(describeError(error));
      }
    } finally {
      busyRef.current = false;
      onBusyChange(false);
    }
  }, [onBusyChange, onResult, onError, stop]);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setHint(
        "This browser does not expose the camera API. Camera access requires HTTPS (or localhost during development).",
      );
      return;
    }

    setHint(null);
    onError(null);
    onReset();
    setStarting(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingRef.current,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error("Video element is not available.");

      video.srcObject = stream;
      await video.play();

      activeRef.current = true;
      setLive(true);
      timerRef.current = window.setInterval(() => {
        void tick();
      }, FRAME_INTERVAL_MS);
    } catch (error) {
      const stream = streamRef.current;
      streamRef.current = null;
      if (stream) for (const track of stream.getTracks()) track.stop();
      setLive(false);
      setHint(cameraErrorMessage(error));
    } finally {
      setStarting(false);
    }
  }, [onError, onReset, tick]);

  async function handleFlip() {
    const next: Facing = facing === "user" ? "environment" : "user";
    const wasLive = activeRef.current;
    stop();
    facingRef.current = next;
    setFacing(next);
    if (wasLive) await start();
  }

  return (
    <section
      id="mode-panel-webcam"
      role="tabpanel"
      aria-labelledby="mode-tab-webcam"
      className="glass-strong panel-glow overflow-hidden rounded-2xl"
    >
      <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <p className="label-chip">Live camera</p>
        <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 rounded-full ${
              live ? "animate-pulse-soft bg-danger" : "bg-muted/50"
            }`}
          />
          {live ? "on air" : "off"}
        </span>
      </header>

      <div className="relative min-h-[280px] bg-ink/70 sm:min-h-[360px]">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`block w-full ${facing === "user" ? "-scale-x-100" : ""}`}
        />

        <canvas
          ref={overlayRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
        />

        {!live && !starting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <Camera size={30} aria-hidden="true" className="text-muted/50" />
            <p className="max-w-xs text-[13px] leading-relaxed text-muted">
              Start the camera to analyse your expression live. Frames are sent
              to the backend — nothing is recorded or stored.
            </p>
          </div>
        )}

        {starting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <LoaderCircle size={22} aria-hidden="true" className="animate-spin text-accent" />
            <p className="font-mono text-[11px] tracking-widest text-muted">
              REQUESTING CAMERA…
            </p>
          </div>
        )}
      </div>

      <footer className="flex flex-wrap items-center gap-3 border-t border-line px-5 py-4">
        {live ? (
          <button type="button" className={btnGhost} onClick={stop}>
            <Square size={15} aria-hidden="true" /> Stop camera
          </button>
        ) : (
          <button
            type="button"
            className={btnPrimary}
            onClick={() => void start()}
            disabled={starting}
          >
            <Play size={15} aria-hidden="true" /> Start camera
          </button>
        )}

        <button
          type="button"
          className={btnGhost}
          onClick={() => void handleFlip()}
          disabled={!live || starting}
        >
          <SwitchCamera size={15} aria-hidden="true" /> Flip
        </button>

        <p className="ml-auto font-mono text-[10px] tracking-[0.16em] text-muted/70">
          {live ? `1 FRAME / ${FRAME_INTERVAL_MS} MS` : "IDLE"}
        </p>
      </footer>

      {hint && (
        <p
          role="alert"
          className="flex items-start gap-2 border-t border-line bg-danger/[0.06] px-5 py-3 text-[13px] leading-relaxed text-danger"
        >
          <CircleX size={15} aria-hidden="true" className="mt-0.5 shrink-0" />
          {hint}
        </p>
      )}
    </section>
  );
}
