"use client";

import { useState } from "react";
import { emotionMeta } from "@/lib/emotions";
import type { DetectionSource, PredictionResponse } from "@/lib/types";
import { ProbabilityBars } from "./ProbabilityBars";

type PanelStatus = "idle" | "analyzing" | "result" | "no_face" | "error";

interface ResultPanelProps {
  result: PredictionResponse | null;
  error: string | null;
  busy: boolean;
  source: DetectionSource | null;
}

const STATUS_STYLES: Record<PanelStatus, { label: string; className: string }> = {
  idle: { label: "Awaiting input", className: "border-line text-muted" },
  analyzing: { label: "Analyzing", className: "border-warning/40 text-warning" },
  result: { label: "Face detected", className: "border-success/40 text-success" },
  no_face: { label: "No face found", className: "border-warning/40 text-warning" },
  error: { label: "Request failed", className: "border-danger/40 text-danger" },
};

/** Arc-shaped confidence gauge (SVG, dependency free). */
function ConfidenceGauge({ value, color }: { value: number; color: string }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const arc = circumference * 0.75; // 270° gauge
  const filled = arc * Math.min(Math.max(value, 0), 1);

  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-[135deg]">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(148,163,184,0.16)"
          strokeWidth="9"
          strokeDasharray={`${arc} ${circumference}`}
          strokeLinecap="round"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          className="transition-[stroke-dasharray] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-xl font-semibold text-frost">
          {(value * 100).toFixed(0)}%
        </span>
        <span className="font-mono text-[9px] tracking-[0.18em] text-muted">CONF</span>
      </div>
    </div>
  );
}

export function ResultPanel({ result, error, busy, source }: ResultPanelProps) {
  // Manual face choice, bound to the exact result object it was made on.
  // When a new result arrives the reference no longer matches, so the panel
  // falls back to the most confident face — no effects needed.
  const [pick, setPick] = useState<{ result: PredictionResponse; index: number } | null>(null);

  const status: PanelStatus = error
    ? "error"
    : busy
      ? "analyzing"
      : result
        ? result.status === "ok"
          ? "result"
          : "no_face"
        : "idle";

  const faceCount = result?.faces.length ?? 0;

  let bestFace = 0;
  if (result) {
    result.faces.forEach((face, index) => {
      if (face.confidence > (result.faces[bestFace]?.confidence ?? 0)) bestFace = index;
    });
  }

  const selectedFace =
    faceCount === 0
      ? 0
      : pick && pick.result === result && pick.index < faceCount
        ? pick.index
        : bestFace;

  const face = result?.faces[selectedFace] ?? null;
  const meta = face ? emotionMeta(face.emotion) : null;
  const style = STATUS_STYLES[status];

  return (
    <aside className="glass-strong panel-glow flex flex-col rounded-2xl" aria-label="Detection results">
      <header className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <h2 className="font-display text-sm font-semibold tracking-wider text-frost">
            Live Results
          </h2>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            {source ? `source · ${source}` : "no active session"}
          </p>
        </div>
        <span className={`rounded-full border px-2.5 py-1 font-display text-[10px] tracking-widest ${style.className}`}>
          {busy ? "···" : ""} {style.label}
        </span>
      </header>

      <div className="flex flex-1 flex-col gap-5 p-5">
        {/* ------------------------------------------------ error state */}
        {error && (
          <div className="rounded-xl border border-danger/30 bg-danger/[0.07] p-4">
            <p className="font-display text-xs font-semibold tracking-wider text-danger">
              Inference request failed
            </p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{error}</p>
          </div>
        )}

        {/* ------------------------------------------------ empty state */}
        {!error && !result && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
            <svg viewBox="0 0 48 48" className="h-12 w-12 text-muted/40" fill="none" stroke="currentColor" strokeWidth="1.4">
              <rect x="7" y="7" width="34" height="34" rx="6" strokeDasharray="5 6" />
              <circle cx="24" cy="21" r="6" />
              <path d="M14 36c2.8-5 6.8-7.5 10-7.5s7.2 2.5 10 7.5" strokeLinecap="round" />
            </svg>
            <p className="max-w-[15rem] text-[13px] leading-relaxed text-muted">
              Results appear here the moment the backend returns a prediction.
              Start the camera or upload media to begin.
            </p>
          </div>
        )}

        {/* ------------------------------------------------ no face */}
        {!error && result && result.status === "no_face" && (
          <div className="rounded-xl border border-warning/30 bg-warning/[0.06] p-4">
            <p className="font-display text-xs font-semibold tracking-wider text-warning">
              No face detected
            </p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
              The frame was processed successfully, but the Haar cascade found
              no frontal face. Try better lighting or move closer to the camera.
            </p>
          </div>
        )}

        {/* ------------------------------------------------ prediction */}
        {!error && result && result.status === "ok" && face && meta && (
          <>
            <div className="flex items-center gap-4 rounded-xl border border-line bg-surface/60 p-4">
              <ConfidenceGauge value={face.confidence} color={meta.color} />
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                  Dominant emotion
                </p>
                <p
                  className="mt-1 truncate font-display text-2xl font-semibold tracking-tight"
                  style={{ color: meta.color }}
                >
                  {meta.label}
                </p>
                <p className="mt-1 text-[12px] leading-snug text-muted">{meta.hint}</p>
              </div>
            </div>

            {result.face_count > 1 && (
              <div>
                <p className="label-chip mb-2">
                  Faces detected · {result.face_count}
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.faces.map((item, index) => {
                    const itemMeta = emotionMeta(item.emotion);
                    const active = index === selectedFace;
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => result && setPick({ result, index })}
                        className={`rounded-lg border px-2.5 py-1.5 font-display text-[11px] tracking-wide transition-all ${
                          active ? "bg-white/[0.06]" : "border-line hover:border-line-strong"
                        }`}
                        style={active ? { borderColor: itemMeta.color, color: itemMeta.color } : { color: "var(--color-muted)" }}
                      >
                        #{index + 1} · {itemMeta.label} {(item.confidence * 100).toFixed(0)}%
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <p className="label-chip mb-3">Class probabilities</p>
              <ProbabilityBars probabilities={face.probabilities} />
            </div>

            <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-line pt-4">
              {[
                ["faces", String(result.face_count)],
                ["detect", `${result.detection_ms.toFixed(0)} ms`],
                ["infer", `${result.inference_ms.toFixed(0)} ms`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-surface/60 px-2 py-2 text-center">
                  <dt className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
                    {label}
                  </dt>
                  <dd className="mt-0.5 font-display text-[13px] font-semibold text-frost">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="font-mono text-[9.5px] tracking-[0.14em] text-muted/70">
              {result.width}×{result.height} PX · MODEL {result.model.toUpperCase()}
            </p>
          </>
        )}
      </div>
    </aside>
  );
}
