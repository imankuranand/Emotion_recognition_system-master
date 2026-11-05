"use client";

import { useCallback, useRef, useState } from "react";
import { CircleExclamationPoint, Images, LoaderCircle, Upload, X } from "lucide-react";

import { describeError, predictImage } from "@/lib/api";
import { clearOverlay, drawDetections } from "@/lib/draw";
import { fileToNormalizedJpeg } from "@/lib/media";
import { btnGhost, btnPrimary } from "@/lib/ui";
import type { ModeProps } from "./shared";

const MAX_FILE_BYTES = 12 * 1024 * 1024;
const MAX_SIDE = 1600;

export function ImageMode({ onResult, onBusyChange, onError, onReset }: ModeProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [analysing, setAnalysing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const clear = useCallback(() => {
    setPreviewUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return null;
    });
    setFileName(null);
    setLocalError(null);
    clearOverlay(overlayRef.current);
    onError(null);
    onReset();
  }, [onError, onReset]);

  const analyse = useCallback(
    async (file: File) => {
      setLocalError(null);
      onError(null);

      if (!file.type.startsWith("image/")) {
        setLocalError(
          `"${file.name}" is not an image. Choose a JPEG, PNG or WebP file.`,
        );
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        setLocalError(
          `That image is ${(file.size / 1024 / 1024).toFixed(1)} MB — the limit is 12 MB.`,
        );
        return;
      }

      setAnalysing(true);
      onBusyChange(true);
      clearOverlay(overlayRef.current);

      try {
        // Normalise first: the preview below shows the exact bytes the model
        // receives, so the boxes land where the user sees the face.
        const { blob } = await fileToNormalizedJpeg(file, MAX_SIDE);

        setPreviewUrl((previous) => {
          if (previous) URL.revokeObjectURL(previous);
          return URL.createObjectURL(blob);
        });
        setFileName(file.name);
        onReset();

        const result = await predictImage(blob, file.name);
        const overlay = overlayRef.current;
        if (overlay) drawDetections(overlay, result);
        onResult(result);
      } catch (error) {
        onError(describeError(error));
      } finally {
        setAnalysing(false);
        onBusyChange(false);
      }
    },
    [onBusyChange, onError, onResult, onReset],
  );

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) void analyse(file);
  }

  return (
    <section
      id="mode-panel-image"
      role="tabpanel"
      aria-labelledby="mode-tab-image"
      className="glass-strong panel-glow overflow-hidden rounded-2xl"
    >
      <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <p className="label-chip">Image analysis</p>
        {fileName && (
          <span className="max-w-[60%] truncate font-mono text-[10px] tracking-[0.14em] text-muted">
            {fileName}
          </span>
        )}
      </header>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={`relative min-h-[280px] transition-colors duration-150 sm:min-h-[360px] ${
          dragging ? "bg-accent/[0.06]" : "bg-ink/70"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />

        {previewUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Uploaded photo awaiting emotion analysis"
              className="block w-full"
            />
            <canvas
              ref={overlayRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full"
            />
            {analysing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink/55">
                <LoaderCircle size={22} aria-hidden="true" className="animate-spin text-accent" />
                <p className="font-mono text-[11px] tracking-widest text-muted">
                  ANALYSING…
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <Upload size={28} aria-hidden="true" className="text-muted/50" />
            <div>
              <p className="font-display text-sm font-medium text-frost">
                Drop an image here
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">
                JPEG, PNG or WebP · up to 12 MB · auto-analysed on upload
              </p>
            </div>
            <button
              type="button"
              className={btnPrimary}
              onClick={() => inputRef.current?.click()}
            >
              <Images size={15} aria-hidden="true" /> Browse images
            </button>
          </div>
        )}
      </div>

      <footer className="flex flex-wrap items-center gap-3 border-t border-line px-5 py-4">
        <button
          type="button"
          className={btnGhost}
          onClick={() => inputRef.current?.click()}
          disabled={analysing}
        >
          <Upload size={15} aria-hidden="true" /> {previewUrl ? "Replace" : "Choose image"}
        </button>

        <button
          type="button"
          className={btnGhost}
          onClick={clear}
          disabled={!previewUrl || analysing}
        >
          <X size={15} aria-hidden="true" /> Clear
        </button>

        <p className="ml-auto font-mono text-[10px] tracking-[0.16em] text-muted/70">
          {previewUrl ? "ANALYSED ON UPLOAD" : "NO IMAGE"}
        </p>
      </footer>

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
