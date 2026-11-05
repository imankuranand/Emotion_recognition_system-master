"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { ChartColumn } from "lucide-react";

import { ModeTabs } from "./ModeTabs";
import { WebcamMode } from "./WebcamMode";
import { ImageMode } from "./ImageMode";
import { VideoMode } from "./VideoMode";
import { ResultPanel } from "./ResultPanel";
import type { AnalysisMode, ModeProps } from "./shared";
import { useSession } from "@/lib/session";
import type { PredictionResponse } from "@/lib/types";
import { btnGhost, pageShell } from "@/lib/ui";

/**
 * Dashboard shell: owns the shared result/error/busy state that the three
 * mode panels feed and the results rail renders. Every recorded analysis is
 * a genuine backend response.
 */
export default function DashboardClient() {
  const [mode, setMode] = useState<AnalysisMode>("webcam");
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { addDetection, stats } = useSession();

  const handleResult = useCallback(
    (response: PredictionResponse, label?: string) => {
      setResult(response);
      setError(null);

      if (response.status === "ok" && response.faces.length > 0) {
        const top = response.faces.reduce((best, face) =>
          face.confidence > best.confidence ? face : best,
        );
        addDetection({
          source: mode,
          emotion: top.emotion,
          confidence: top.confidence,
          faceCount: response.face_count,
          probabilities: top.probabilities,
          inferenceMs: response.inference_ms,
          label,
        });
      }
    },
    [addDetection, mode],
  );

  const handleModeChange = useCallback(
    (next: AnalysisMode) => {
      if (next === mode) return;
      setMode(next);
      setResult(null);
      setError(null);
      setBusy(false);
    },
    [mode],
  );

  const handleReset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  const modeProps: ModeProps = {
    onResult: handleResult,
    onBusyChange: setBusy,
    onError: setError,
    onReset: handleReset,
  };

  return (
    <div className={`${pageShell} pb-24 pt-28`}>
      {/* ---------------------------------------------------------- header */}
      <header className="mb-7 max-w-3xl">
        <p className="label-chip">Emotion detection dashboard</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-frost sm:text-4xl">
          Analyse expressions in real time
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
          Pick a source, then watch the eight-class probability vector update
          as the ONNX model returns. Every reading below comes straight from
          the backend — nothing on this page is simulated.
        </p>
      </header>

      {/* ---------------------------------------------------- session strip */}
      <div className="mb-7 flex flex-wrap items-center gap-2.5">
        <span className="monoChip">ANALYSES · {stats.totalAnalyses}</span>
        <span className="monoChip">FACES · {stats.totalFaces}</span>
        <span className="monoChip">
          AVG CONFIDENCE ·{" "}
          {stats.totalAnalyses > 0
            ? `${(stats.averageConfidence * 100).toFixed(0)}%`
            : "—"}
        </span>
        <span className="monoChip">
          TOP EMOTION · {stats.topEmotion ? stats.topEmotion.toUpperCase() : "—"}
        </span>
        <Link href="/analytics" className={`${btnGhost} ml-auto px-3.5 py-1.5 text-xs`}>
          <ChartColumn size={14} aria-hidden="true" /> Open analytics
        </Link>
      </div>

      {/* --------------------------------------------------------- main grid */}
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_384px]">
        <div className="flex flex-col gap-4">
          <ModeTabs value={mode} onChange={handleModeChange} />

          {mode === "webcam" && <WebcamMode {...modeProps} />}
          {mode === "image" && <ImageMode {...modeProps} />}
          {mode === "video" && <VideoMode {...modeProps} />}
        </div>

        <div className="lg:sticky lg:top-24">
          <ResultPanel result={result} error={error} busy={busy} source={mode} />
        </div>
      </div>
    </div>
  );
}
