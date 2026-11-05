import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  Camera,
  Gauge,
  ScanFace,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";

import { btnPrimary, card, monoChip, pageShell } from "@/lib/ui";

export const metadata: Metadata = {
  title: "About",
  description:
    "What AFFECTRA is, how the detection pipeline works, what the model can and cannot do, and where the project is headed next.",
};

const OBJECTIVES = [
  {
    icon: <ScanFace size={16} aria-hidden="true" />,
    title: "Accurate real-time inference",
    body: "Detect faces with a Haar cascade and classify each one into eight emotion classes with an ONNX-compiled FER+ network — comfortably faster than real time on a CPU.",
  },
  {
    icon: <Activity size={16} aria-hidden="true" />,
    title: "Honest analytics",
    body: "Every chart on the analytics page is aggregated from actual backend responses. Nothing is mocked, seeded or simulated.",
  },
  {
    icon: <Shield size={16} aria-hidden="true" />,
    title: "Privacy by design",
    body: "Frames are processed in memory and never written to disk or a database. The analytics session lives in the browser and dies with the tab.",
  },
  {
    icon: <Zap size={16} aria-hidden="true" />,
    title: "Deployable architecture",
    body: "A framework-neutral ONNX backend (FastAPI + onnxruntime) behind a statically exported-friendly Next.js frontend, with all secrets and URLs in environment variables.",
  },
];

const PIPELINE = [
  {
    step: "01",
    title: "Capture",
    body: "The browser grabs a webcam frame, an uploaded photo or a sampled video frame and POSTs it as multipart JPEG.",
  },
  {
    step: "02",
    title: "Detect",
    body: "OpenCV's frontal-face Haar cascade runs on a 4× downscaled grayscale copy for speed, then boxes are scaled back to full resolution and clipped.",
  },
  {
    step: "03",
    title: "Classify",
    body: "Each face is cropped, resized to 64×64 grayscale and fed to emotion-ferplus-8.onnx. The graph normalises internally, so raw 0–255 pixels go in.",
  },
  {
    step: "04",
    title: "Explain",
    body: "The softmax vector over eight classes comes back with the box; the UI draws it on a canvas and the session store folds it into analytics.",
  },
];

const LIMITATIONS = [
  "Facial expressions are an imperfect proxy for emotion — the model reads muscular movement, not feelings or intent.",
  "FER+ was trained on facial images and inherits their biases; accuracy varies across demographics, lighting and camera angles.",
  "Haar cascades look for frontal faces, so profile views or heavy occlusion will return \"no face\".",
  "This is an academic demonstration, not a medical, psychological or hiring tool, and must not be used as one.",
];

export default function AboutPage() {
  return (
    <div className={`${pageShell} pb-24 pt-28`}>
      {/* -------------------------------------------------------- hero */}
      <header className="max-w-3xl">
        <p className="label-chip">About the project</p>
        <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-frost sm:text-4xl">
          AFFECTRA — facial emotion recognition, built to be understood
        </h1>
        <p className="mt-4 text-[15.5px] leading-relaxed text-muted">
          AFFECTRA is a B.Tech capstone project: a full-stack system that
          detects faces in real time and classifies each one into eight
          emotion classes, then turns those predictions into session-level
          analytics. It grew out of a legacy TensorFlow 1.x training repo and
          was rebuilt around a deployable ONNX inference path — same science,
          production-shaped engineering.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link href="/dashboard" className={btnPrimary}>
            <Camera size={15} aria-hidden="true" /> Try the dashboard
          </Link>
          <Link href="/docs" className="monoChip px-3.5! py-2!">
            Read the documentation
          </Link>
        </div>
      </header>

      {/* ---------------------------------------------------- objectives */}
      <section aria-labelledby="objectives-title" className="mt-14">
        <h2 id="objectives-title" className="font-display text-xl font-semibold text-frost">
          What the project set out to do
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {OBJECTIVES.map((objective) => (
            <div key={objective.title} className={`${card} p-5`}>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
                {objective.icon}
              </span>
              <h3 className="mt-3.5 font-display text-[15px] font-semibold text-frost">
                {objective.title}
              </h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
                {objective.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------- pipeline */}
      <section aria-labelledby="pipeline-title" className="mt-14">
        <h2 id="pipeline-title" className="font-display text-xl font-semibold text-frost">
          How a frame becomes a result
        </h2>
        <ol className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {PIPELINE.map((stage) => (
            <li key={stage.step} className={`${card} relative p-5`}>
              <span className="font-mono text-[11px] tracking-[0.2em] text-accent">
                {stage.step}
              </span>
              <h3 className="mt-2 font-display text-[15px] font-semibold text-frost">
                {stage.title}
              </h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
                {stage.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* --------------------------------------------------- model card */}
      <section aria-labelledby="model-title" className={`${card} mt-14 p-6`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="model-title" className="font-display text-xl font-semibold text-frost">
            The model
          </h2>
          <span className={monoChip}>emotion-ferplus-8 · ONNX · 35 MB</span>
        </div>

        <div className="mt-4 grid gap-4 text-[13.5px] leading-relaxed text-muted sm:grid-cols-2">
          <p>
            <span className="text-frost">Architecture — </span>
            A compact convolutional network (ONNX Model Zoo&rsquo;s{" "}
            <span className="text-accent">Emotion FERPlus</span>), trained on
            the FERPlus relabeling of the FER2013 dataset and compiled to a
            single <span className="text-frost">.onnx</span> graph executed
            with ONNX Runtime on CPU.
          </p>
          <p>
            <span className="text-frost">Input contract — </span>
            One 64×64 grayscale plane as float32 in raw 0–255 range; the graph
            performs its own mean/std normalisation internally.
          </p>
          <p>
            <span className="text-frost">Output — </span>
            Eight logits → softmax: neutral, happiness, surprise, sadness,
            anger, disgust, fear, contempt. The UI shows the full vector, not
            just the winner.
          </p>
          <p>
            <span className="text-frost">Face detection — </span>
            OpenCV Haar cascade (<span className="text-frost">
              frontalface_default
            </span>
            ) on a downscaled copy, boxes scaled back, up to 8 faces per
            frame.
          </p>
        </div>
      </section>

      {/* -------------------------------------------------- limitations */}
      <section aria-labelledby="limits-title" className="mt-14">
        <h2 id="limits-title" className="font-display text-xl font-semibold text-frost">
          Honest limitations &amp; responsible use
        </h2>
        <div className={`${card} mt-5 p-6`}>
          <ul className="flex flex-col gap-3">
            {LIMITATIONS.map((item) => (
              <li key={item} className="flex gap-3 text-[13.5px] leading-relaxed text-muted">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-warning/70" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-5 border-t border-line pt-4 text-[13px] leading-relaxed text-muted/80">
            <Shield size={13} aria-hidden="true" className="mr-1.5 inline align-[-2px] text-accent" />
            Privacy: uploaded frames are analysed in memory on the backend and
            are never stored, logged or shared. Analytics data stays in your
            browser and is cleared with one click.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------ tech + scope */}
      <div className="mt-14 grid gap-5 lg:grid-cols-2">
        <section aria-labelledby="stack-title" className={`${card} p-6`}>
          <h2 id="stack-title" className="font-display text-lg font-semibold text-frost">
            Built with
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              "Next.js 16",
              "React 19",
              "TypeScript",
              "Tailwind CSS v4",
              "Recharts",
              "lucide-react",
              "FastAPI",
              "ONNX Runtime",
              "OpenCV",
              "NumPy",
              "Pydantic",
              "Docker",
            ].map((tech) => (
              <span key={tech} className={monoChip}>
                {tech}
              </span>
            ))}
          </div>
          <p className="mt-4 text-[13.5px] leading-relaxed text-muted">
            The original repository&rsquo;s TensorFlow 1.x training pipeline
            (<span className="text-frost">retrain.py</span>, label image
            folder tooling) is preserved under{" "}
            <span className="text-accent">/training</span> so the full lifecycle
            — train → freeze → convert → serve — stays documented.
          </p>
        </section>

        <section aria-labelledby="scope-title" className={`${card} p-6`}>
          <h2 id="scope-title" className="font-display text-lg font-semibold text-frost">
            Future scope
          </h2>
          <ul className="mt-4 flex flex-col gap-2.5 text-[13.5px] leading-relaxed text-muted">
            {[
              "Swap the Haar cascade for an ONNX face detector (e.g. BlazeFace) to catch profile views.",
              "Temporal smoothing across video frames to reduce per-frame jitter.",
              "Optional on-device inference via ONNX Runtime Web (WASM/WebGPU) for fully offline use.",
              "Exportable session reports (CSV/PDF) from the analytics view.",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <Sparkles size={13} aria-hidden="true" className="mt-1 shrink-0 text-accent/70" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* --------------------------------------------------------- CTA */}
      <section className={`${card} mt-14 flex flex-col items-center gap-4 px-6 py-12 text-center`}>
        <Gauge size={26} aria-hidden="true" className="text-accent" />
        <h2 className="max-w-xl font-display text-xl font-semibold text-frost">
          The fastest way to understand it is to run it
        </h2>
        <p className="max-w-lg text-[13.5px] leading-relaxed text-muted">
          Start the backend, open the dashboard and watch eight probabilities
          move with your own expression.
        </p>
        <Link href="/dashboard" className={btnPrimary}>
          Launch AFFECTRA
        </Link>
      </section>
    </div>
  );
}
