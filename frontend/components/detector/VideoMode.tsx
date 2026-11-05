"use client";

import { useCallback, useRef, useState } from "react";
import {
  CircleExclamationPoint,
  Frame,
  LoaderCircle,
  Play,
  Square,
  Upload,
  X,
} from "lucide-react";

import { describeError, predictImage } from "@/lib/api";
import { clearOverlay, drawDetections } from "@/lib/draw";
import { captureFrame, formatTime, seekTo } from "@/lib/media";
import { btnGhost, btnPrimary, monoChip } from "@/lib/ui";
import { emotionMeta } from "@/lib/emotions";
import type { Emotion } from "@/lib/types";
import type { ModeProps } from "./shared";

const FPS_OPTIONS = [1, 2, 4] as const;
type Fps = (typeof FPS_OPTIONS)[number];

interface FrameSummary {
  time: number;
  emotion: Emotion | null;
  confidence: number | null;
  faceCount: number;
}

const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|m4v|ogv|mkv)$/i;

export function VideoMode({ onResult, onBusyChange, onError, onReset }: ModeProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const runRef = useRef(false);

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [fps, setFps] = useState<Fps>(1);
  const [progress, setProgress] = useState(0);
  const [frames, setFrames] = useState<FrameSummary[]>([]);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const totalFrames = duration > 0 ? Math.ceil(duration * fps) : 0;

  const reset = useCallback(() => {
    runRef.current = false;
    setVideoUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return null;
    });
    setFileName(null);
    setDuration(0);
    setProgress(0);
    setFrames([]);
    setRunning(false);
    setFinished(false);
    setLocalError(null);
    clearOverlay(overlayRef.current);
    onError(null);
    onReset();
  }, [onError, onReset]);

  const stopRun = useCallback(() => {
    runRef.current = false;
    setRunning(false);
    videoRef.current?.pause();
    onBusyChange(false);
  }, [onBusyChange]);

  function handleFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/") && !VIDEO_EXTENSIONS.test(file.name)) {
      setLocalError(`"${file.name}" is not a supported video file.`);
      return;
    }

    setLocalError(null);
    onError(null);
    onReset();
    runRef.current = false;
    setRunning(false);
    setFinished(false);
    setFrames([]);
    setProgress(0);
    clearOverlay(overlayRef.current);
    setVideoUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return URL.createObjectURL(file);
    });
    setFileName(file.name);
  }

  /** Walk the clip frame by frame: seek → capture → send → record. */
  const run = useCallback(async () => {
    const video = videoRef.current;
    if (!video || duration <= 0) return;

    runRef.current = true;
    setRunning(true);
    setFinished(false);
    setFrames([]);
    setProgress(0);
    onError(null);
    onBusyChange(true);

    const step = 1 / fps;

    try {
      let time = 0;

      while (runRef.current && time < duration - 0.001) {
        await seekTo(video, Math.min(time, Math.max(0, duration - 0.05)));
        if (!runRef.current) break;

        const blob = await captureFrame(video, false);
        if (!blob || !runRef.current) break;

        const result = await predictImage(blob, `frame-${Math.floor(time * 100)}.jpg`, 20_000);
        if (!runRef.current) break;

        const overlay = overlayRef.current;
        if (overlay) drawDetections(overlay, result);
        onResult(result, formatTime(time));

        const topFace = result.faces.length
          ? result.faces.reduce((best, face) =>
              face.confidence > best.confidence ? face : best,
            )
          : null;

        setFrames((previous) => [
          ...previous,
          {
            time,
            emotion: topFace?.emotion ?? null,
            confidence: topFace?.confidence ?? null,
            faceCount: result.face_count,
          },
        ]);

        setProgress(Math.min(1, (time + step) / duration));
        time += step;
      }

      if (runRef.current) {
        setFinished(true);
        setProgress(1);
      }
    } catch (error) {
      onError(describeError(error));
    } finally {
      runRef.current = false;
      setRunning(false);
      onBusyChange(false);
    }
  }, [duration, fps, onBusyChange, onError, onResult]);

  const framesWithFaces = frames.filter((frame) => frame.emotion !== null).length;

  return (
    <section
      id="mode-panel-video"
      role="tabpanel"
      aria-labelledby="mode-tab-video"
      className="glass-strong panel-glow overflow-hidden rounded-2xl"
    >
      <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <p className="label-chip">Video analysis</p>
        {fileName && (
          <span className="max-w-[60%] truncate font-mono text-[10px] tracking-[0.14em] text-muted">
            {fileName}
          </span>
        )}
      </header>

      <div className="relative min-h-[240px] bg-ink/70 sm:min-h-[300px]">
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="sr-only"
          onChange={(event) => {
            handleFile(event.target.files);
            event.target.value = "";
          }}
        />

        {videoUrl ? (
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              muted
              playsInline
              preload="metadata"
              onLoadedMetadata={(event) => {
                const value = event.currentTarget.duration;
                setDuration(Number.isFinite(value) ? value : 0);
              }}
              className="block w-full"
            />
            <canvas
              ref={overlayRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full"
            />
            {running && (
              <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-md border border-line bg-ink/85 px-2.5 py-1.5">
                <LoaderCircle size={13} aria-hidden="true" className="animate-spin text-accent" />
                <span className="font-mono text-[10px] tracking-[0.16em] text-frost">
                  FRAME {Math.min(frames.length + 1, totalFrames)} / {totalFrames}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <Frame size={28} aria-hidden="true" className="text-muted/50" />
            <div>
              <p className="font-display text-sm font-medium text-frost">
                Upload a clip to scan
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">
                The backend receives sampled frames at your chosen rate — the
                video itself never leaves the machine.
              </p>
            </div>
            <button
              type="button"
              className={btnPrimary}
              onClick={() => inputRef.current?.click()}
            >
              <Upload size={15} aria-hidden="true" /> Browse videos
            </button>
          </div>
        )}
      </div>

      {videoUrl && (
        <div className="border-t border-line px-5 py-4">
          {/* Progress */}
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-surface"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            aria-label="Analysis progress"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-electric to-accent transition-[width] duration-300"
              style={{ width: `${Math.max(progress * 100, frames.length > 0 ? 2 : 0)}%` }}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            {/* FPS selector */}
            <div
              className="inline-flex items-center gap-1 rounded-lg border border-line p-1"
              role="group"
              aria-label="Sampling rate"
            >
              {FPS_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={fps === option}
                  disabled={running}
                  onClick={() => setFps(option)}
                  className={`rounded-md px-2.5 py-1 font-mono text-[11px] tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:cursor-not-allowed disabled:opacity-50 ${
                    fps === option ? "bg-accent/15 text-accent" : "text-muted hover:text-frost"
                  }`}
                >
                  {option} FPS
                </button>
              ))}
            </div>

            {running ? (
              <button type="button" className={btnGhost} onClick={stopRun}>
                <Square size={15} aria-hidden="true" /> Stop
              </button>
            ) : (
              <button
                type="button"
                className={btnPrimary}
                onClick={() => void run()}
                disabled={duration <= 0}
              >
                <Play size={15} aria-hidden="true" />
                {finished ? "Run again" : "Analyse video"}
              </button>
            )}

            <button type="button" className={btnGhost} onClick={reset} disabled={running}>
              <X size={15} aria-hidden="true" /> Remove
            </button>

            <span className={monoChip}>
              {duration > 0 ? formatTime(duration) : "--:--"} · {totalFrames} FRAMES
            </span>
          </div>

          {/* Per-frame timeline — every chip maps to a real backend response */}
          {frames.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                  Frame timeline
                </p>
                <p className="font-mono text-[10px] tracking-[0.14em] text-muted">
                  {framesWithFaces}/{frames.length} WITH FACE
                </p>
              </div>

              <ul className="flex max-h-36 flex-col gap-1 overflow-y-auto pr-1">
                {frames.map((frame, index) => {
                  const meta = frame.emotion ? emotionMeta(frame.emotion) : null;
                  return (
                    <li
                      key={`${frame.time}-${index}`}
                      className="flex items-center gap-3 rounded-lg border border-line bg-surface/60 px-3 py-1.5"
                    >
                      <span className="font-mono text-[11px] tracking-wider text-muted">
                        {formatTime(frame.time)}
                      </span>
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: meta?.color ?? "var(--color-muted)" }}
                        aria-hidden="true"
                      />
                      {meta && frame.confidence !== null ? (
                        <>
                          <span
                            className="font-display text-[12px] font-medium"
                            style={{ color: meta.color }}
                          >
                            {meta.label}
                          </span>
                          <span className="font-mono text-[11px] text-muted">
                            {(frame.confidence * 100).toFixed(0)}%
                          </span>
                        </>
                      ) : (
                        <span className="text-[12px] text-muted">
                          no face ({frame.faceCount} detected)
                        </span>
                      )}
                      <span className="ml-auto font-mono text-[10px] text-muted/70">
                        #{index + 1}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {finished && (
            <p className="mt-3 font-mono text-[10.5px] tracking-[0.14em] text-success">
              SCAN COMPLETE · {frames.length} FRAMES ANALYSED
            </p>
          )}
        </div>
      )}

      {localError && (
        <p
          role="alert"
          className="flex items-start gap-2 border-t border-line bg-danger/[0.06] px-5 py-3 text-[13px] leading-relaxed text-danger"
        >
          <CircleExclamationPoint
            size={15}
            aria-hidden="true"
            className="mt-0.5 shrink-0"
          />
          {localError}
        </p>
      )}
    </section>
  );
}
