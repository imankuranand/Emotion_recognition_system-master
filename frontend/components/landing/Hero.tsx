"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EMOTIONS } from "@/lib/emotions";
import { btnGhost, btnPrimary, cardStrong } from "@/lib/ui";

/** Landmark points of the schematic face mesh (decorative geometry). */
const LANDMARKS: Array<[number, number]> = [
  [70, 78], [92, 70], [118, 68], [144, 70], [166, 78], // brows
  [78, 96], [96, 92], [118, 94], [140, 92], [158, 96], // eyes
  [118, 104], [110, 122], [126, 122], // nose
  [88, 138], [104, 148], [118, 152], [132, 148], [148, 138], // mouth
  [74, 116], [162, 116], [96, 166], [118, 174], [140, 166], // jaw
];

const MESH_LINES: Array<[number, number, number, number]> = [
  [70, 78, 92, 70], [92, 70, 118, 68], [118, 68, 144, 70], [144, 70, 166, 78],
  [78, 96, 96, 92], [140, 92, 158, 96],
  [118, 104, 110, 122], [110, 122, 126, 122], [126, 122, 118, 104],
  [88, 138, 104, 148], [104, 148, 118, 152], [118, 152, 132, 148], [132, 148, 148, 138],
  [74, 116, 78, 96], [162, 116, 158, 96],
  [96, 166, 118, 174], [118, 174, 140, 166],
];

/**
 * Hero with an animated schematic of the detection pipeline:
 * landmark mesh + scan sweep + cycling emotion readout.
 * This is an illustration of the pipeline – live inference lives in the
 * dashboard and is clearly labelled as such.
 */
export function Hero() {
  const [emotionIndex, setEmotionIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setEmotionIndex((index) => (index + 1) % EMOTIONS.length);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  const active = EMOTIONS[emotionIndex];

  return (
    <section className="relative overflow-hidden">
      <div className="grid-surface pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-5 pb-24 pt-16 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:pt-24">
        {/* ------------------------------------------------ copy */}
        <div className="animate-rise">
          <p className="label-chip mb-5">Facial Emotion Recognition</p>
          <h1 className="font-display text-3xl font-semibold leading-[1.15] tracking-tight text-frost sm:text-4xl lg:text-[2.7rem]">
            Read the emotion
            <br />
            <span className="text-gradient">behind every face.</span>
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted">
            AFFECTRA detects faces in real time, classifies eight emotional
            states with a FER+ convolutional neural network, and streams full
            probability distributions to a professional analytics dashboard –
            live from your browser through a production FastAPI backend.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/dashboard" className={btnPrimary}>
              Start Emotion Detection
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link href="/docs" className={btnGhost}>
              How it works
            </Link>
          </div>

          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-3 border-t border-line pt-6">
            {[
              ["8", "emotion classes"],
              ["64²", "grayscale input"],
              ["3", "analysis modes"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="font-display text-xl font-semibold text-frost">{value}</dt>
                <dd className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                  {label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ------------------------------------------------ schematic */}
        <div className={`animate-rise ${cardStrong} relative p-5 sm:p-6`} style={{ animationDelay: "120ms" }}>
          <div className="mb-4 flex items-center justify-between">
            <span className="label-chip">Pipeline schematic</span>
            <span className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-soft" />
              SCANNING
            </span>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-abyss">
            {/* scan sweep */}
            <div
              className="animate-scan absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-transparent via-accent/25 to-transparent"
              aria-hidden="true"
            />

            <svg
              viewBox="0 0 240 240"
              className="absolute inset-0 h-full w-full"
              role="img"
              aria-label="Schematic face landmark mesh being scanned"
            >
              <defs>
                <linearGradient id="mesh" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.9" />
                </linearGradient>
                <radialGradient id="faceFill" cx="50%" cy="42%" r="60%">
                  <stop offset="0%" stopColor="#123252" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#0a1428" stopOpacity="0.15" />
                </radialGradient>
              </defs>

              {/* head outline + fill */}
              <ellipse cx="118" cy="118" rx="62" ry="76" fill="url(#faceFill)" stroke="url(#mesh)" strokeWidth="1.4" />
              <path
                d="M56 118 C56 70 84 42 118 42 C152 42 180 70 180 118 C180 166 152 196 118 196 C84 196 56 166 56 118 Z"
                fill="none"
                stroke="rgba(148,163,184,0.25)"
                strokeWidth="0.8"
                strokeDasharray="3 5"
              />

              {/* mesh */}
              <g stroke="rgba(34,211,238,0.4)" strokeWidth="0.9">
                {MESH_LINES.map(([x1, y1, x2, y2], index) => (
                  <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} />
                ))}
              </g>
              <g fill="#67e8f9">
                {LANDMARKS.map(([x, y], index) => (
                  <circle key={index} cx={x} cy={y} r="2.1" />
                ))}
              </g>

              {/* detection reticle */}
              <g stroke="#22d3ee" strokeWidth="1.6" fill="none" strokeLinecap="round">
                <path d="M48 40 h16 M48 40 v16" />
                <path d="M188 40 h-16 M188 40 v16" />
                <path d="M48 200 h16 M48 200 v-16" />
                <path d="M188 200 h-16 M188 200 v-16" />
              </g>
              <rect
                x="48"
                y="40"
                width="140"
                height="160"
                rx="4"
                fill="none"
                stroke="rgba(34,211,238,0.35)"
                strokeWidth="1"
                strokeDasharray="6 8"
              />
            </svg>

            {/* cycling emotion readout */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3">
              <span
                key={active.key}
                className="animate-ticker rounded-md border px-2.5 py-1.5 font-display text-xs font-semibold tracking-wider"
                style={{
                  color: active.color,
                  borderColor: `${active.color}55`,
                  background: active.soft,
                }}
              >
                {active.label}
              </span>
              <span className="rounded-md bg-ink/70 px-2 py-1 font-mono text-[9px] tracking-[0.18em] text-muted">
                LANDMARK MESH · 22 PTS
              </span>
            </div>
          </div>

          <p className="mt-4 text-center font-mono text-[10px] tracking-[0.14em] text-muted/70">
            SCHEMATIC PREVIEW — RUN LIVE INFERENCE ON THE DASHBOARD
          </p>
        </div>
      </div>
    </section>
  );
}
