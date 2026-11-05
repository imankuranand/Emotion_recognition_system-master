import type { Metadata } from "next";
import Link from "next/link";

import { card, monoChip, pageShell } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Architecture, API reference, local setup, environment variables and deployment guide for the AFFECTRA facial-emotion system.",
};

/* -------------------------------------------------------------------------- */
/* Small building blocks                                                       */
/* -------------------------------------------------------------------------- */

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-line bg-ink/80 p-4 font-mono text-[12px] leading-relaxed text-muted">
      <code>{children}</code>
    </pre>
  );
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="scroll-mt-28 font-display text-xl font-semibold text-frost"
    >
      {children}
    </h2>
  );
}

function Sub({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-6 font-display text-[15px] font-semibold text-frost">
      {children}
    </h3>
  );
}

const API_ROWS: { method: string; path: string; purpose: string }[] = [
  { method: "GET", path: "/", purpose: "Service name and version." },
  {
    method: "GET",
    path: "/api/health",
    purpose: "Readiness probe: model + detector loaded, class list, version. Used by the navbar status dot.",
  },
  {
    method: "GET",
    path: "/api/model",
    purpose: "Model card: name, source, paper, input size, preprocessing, detector, framework.",
  },
  {
    method: "GET",
    path: "/api/config",
    purpose: "Non-sensitive runtime config (allowed CORS origins, version).",
  },
  {
    method: "POST",
    path: "/api/predict",
    purpose: "multipart/form-data field `file` (JPEG/PNG/WebP/BMP ≤ 10 MB) → boxes + softmax probabilities per face.",
  },
];

const ENV_ROWS: { name: string; where: string; default: string; purpose: string }[] = [
  {
    name: "API_BASE_URL",
    where: "frontend (server)",
    default: "http://localhost:8000",
    purpose: "Base URL used by Next.js server code (session sync, health).",
  },
  {
    name: "NEXT_PUBLIC_API_URL",
    where: "frontend (browser)",
    default: "http://localhost:8000",
    purpose: "Base URL the browser uses for /api/predict. Must point at the same backend.",
  },
  {
    name: "ALLOWED_ORIGINS",
    where: "backend",
    default: "*",
    purpose: "Comma-separated CORS origins — set to your Vercel domain in production.",
  },
  {
    name: "MODEL_PATH",
    where: "backend",
    default: "assets/emotion-ferplus-8.onnx",
    purpose: "Location of the ONNX model file.",
  },
  {
    name: "CASCADE_PATH",
    where: "backend",
    default: "assets/haarcascade_frontalface_default.xml",
    purpose: "Location of the OpenCV Haar cascade XML.",
  },
  {
    name: "MODEL_URL",
    where: "backend",
    default: "Hugging Face Model Zoo URL",
    purpose: "Where to fetch the model if it is missing at startup.",
  },
  {
    name: "MAX_UPLOAD_BYTES",
    where: "backend",
    default: "10485760 (10 MB)",
    purpose: "Request size ceiling for /api/predict.",
  },
  {
    name: "MAX_FACES_PER_IMAGE",
    where: "backend",
    default: "8",
    purpose: "Upper bound of faces classified per frame.",
  },
  {
    name: "DETECT_DOWNSCALE",
    where: "backend",
    default: "4",
    purpose: "Cascade runs at 1/N resolution, boxes are scaled back (legacy behaviour).",
  },
];

/* -------------------------------------------------------------------------- */

export default function DocsPage() {
  return (
    <div className={`${pageShell} pb-24 pt-28`}>
      <header className="max-w-3xl">
        <p className="label-chip">Documentation</p>
        <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-frost sm:text-4xl">
          How AFFECTRA is built &amp; how to run it
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          Everything needed to develop, test and deploy the system: the
          architecture, the exact API contract, the model&rsquo;s input
          requirements, and the honest deployment story.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {[
            ["#architecture", "Architecture"],
            ["#api", "API reference"],
            ["#model", "Model card"],
            ["#setup", "Local setup"],
            ["#env", "Environment"],
            ["#deploy", "Deployment"],
          ].map(([href, label]) => (
            <a key={href} href={href} className={monoChip}>
              {label}
            </a>
          ))}
        </div>
      </header>

      <div className="mt-14 flex flex-col gap-14">
        {/* ------------------------------------------------- architecture */}
        <section aria-labelledby="architecture" className="stack-md">
          <H2 id="architecture">Architecture</H2>
          <p className="max-w-3xl text-[14px] leading-relaxed text-muted">
            Two deployable units connected by one JSON contract: a Next.js
            frontend (Vercel) and a FastAPI + ONNX Runtime service (Render /
            Railway / any Docker host). The browser never touches the model —
            it ships pixels and draws what comes back.
          </p>

          <div className={`${card} overflow-x-auto p-6`}>
            <div className="min-w-[680px] font-mono text-[12px] leading-relaxed text-muted">
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-line bg-surface/60 p-4">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-accent">
                    Browser
                  </p>
                  <p className="text-frost">Next.js 16 (App Router)</p>
                  <p>· webcam / image / video capture</p>
                  <p>· canvas overlay renderer</p>
                  <p>· session store → analytics</p>
                </div>
                <div className="flex items-center justify-center rounded-xl border border-dashed border-accent/40 bg-accent/[0.04] p-4 text-center">
                  <span className="text-accent">
                    POST /api/predict
                    <br />
                    multipart JPEG
                    <br />↓ JSON boxes + probs ↑
                  </span>
                </div>
                <div className="rounded-xl border border-line bg-surface/60 p-4">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-accent">
                    Backend
                  </p>
                  <p className="text-frost">FastAPI (uvicorn)</p>
                  <p>· Haar cascade detection</p>
                  <p>· 64×64 grayscale crop</p>
                  <p>· ONNX Runtime inference</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-line bg-surface/60 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-accent">
                  Repository layout
                </p>
                <p className="mt-1.5">
                  backend/ &nbsp;app (routers, ml engine, pipeline) · assets
                  (model + cascade) · scripts (download, validate) · Dockerfile
                </p>
                <p>
                  frontend/ &nbsp;app (routes) · components (landing, detector,
                  analytics, layout) · lib (api, draw, session, media)
                </p>
                <p>
                  training/ &nbsp;preserved TensorFlow 1.x retraining pipeline
                  from the original repository
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------- api */}
        <section aria-labelledby="api" className="stack-md">
          <H2 id="api">API reference</H2>

          <div className={`${card} overflow-x-auto`}>
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line">
                  {["Method", "Path", "Purpose"].map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {API_ROWS.map((row) => (
                  <tr key={row.path} className="border-b border-line/60 last:border-0">
                    <td className="whitespace-nowrap px-5 py-3">
                      <span
                        className={`font-mono text-[11px] font-semibold ${
                          row.method === "POST" ? "text-accent" : "text-electric"
                        }`}
                      >
                        {row.method}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-[12.5px] text-frost">
                      {row.path}
                    </td>
                    <td className="px-5 py-3 text-[13px] leading-relaxed text-muted">
                      {row.purpose}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Sub>Example — classify an image</Sub>
          <Code>{`curl -X POST "$API_URL/api/predict" \\
  -F "file=@face.jpg"

# 200 response (one face):
{
  "status": "ok",
  "face_count": 1,
  "faces": [{
    "box": [182, 96, 141, 141],          // x, y, w, h
    "emotion": "happiness",
    "confidence": 0.987,
    "emotion_index": 1,
    "probabilities": { "neutral": 0.001, "happiness": 0.987, ... }
  }],
  "width": 1280, "height": 720,
  "detection_ms": 7.4, "inference_ms": 3.1,
  "model": "emotion-ferplus-8"
}`}</Code>
          <p className="text-[13px] leading-relaxed text-muted">
            Status codes: <span className="text-frost">503</span> model not
            loaded · <span className="text-frost">415</span> wrong media type ·{" "}
            <span className="text-frost">413</span> too large ·{" "}
            <span className="text-frost">422</span> undecodable/empty file.
            When no face is found the response is still{" "}
            <span className="text-frost">200</span> with{" "}
            <span className="text-frost">
              &quot;status&quot;: &quot;no_face&quot;
            </span>{" "}
            — the UI
            distinguishes &ldquo;nothing detected&rdquo; from &ldquo;request
            failed&rdquo;.
          </p>
        </section>

        {/* -------------------------------------------------------- model */}
        <section aria-labelledby="model" className="stack-md">
          <H2 id="model">Model card</H2>
          <div className={`${card} p-6`}>
            <div className="flex flex-wrap gap-2">
              <span className={monoChip}>emotion-ferplus-8.onnx</span>
              <span className={monoChip}>35 MB</span>
              <span className={monoChip}>ONNX Model Zoo</span>
              <span className={monoChip}>CPU · onnxruntime</span>
            </div>

            <dl className="mt-5 grid gap-x-8 gap-y-3 text-[13.5px] sm:grid-cols-2">
              {[
                ["Input tensor", "Input3 → [1, 1, 64, 64] float32, raw grayscale 0–255"],
                ["Preprocessing", "Resize face crop to 64×64, single channel; the graph applies Sub(127.5)/Div(255) itself"],
                ["Output tensor", "Plus692_Output_0 → [1, 8] softmax"],
                ["Classes", "neutral · happiness · surprise · sadness · anger · disgust · fear · contempt"],
                ["Face detector", "OpenCV Haar cascade (frontalface_default), 4× downscale, minNeighbors=5, max 8 faces"],
                ["Source", "huggingface.co/onnxmodelzoo/emotion-ferplus-8"],
              ].map(([term, detail]) => (
                <div key={term}>
                  <dt className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-accent">
                    {term}
                  </dt>
                  <dd className="mt-0.5 leading-relaxed text-muted">{detail}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-5 border-t border-line pt-4 text-[13px] leading-relaxed text-muted">
              Why ONNX instead of the original TensorFlow 1.x graph? TF1 needs
              a Python ≤3.7 runtime and ships ~200 MB of dependencies — it
              cannot be deployed on modern hosts. The ONNX graph is
              framework-neutral, has wheels for current Python versions and
              runs the same math. The original training code remains in{" "}
              <span className="text-frost">/training</span>; conversion to
              ONNX is a documented one-liner there.
            </p>
          </div>
        </section>

        {/* --------------------------------------------------------- setup */}
        <section aria-labelledby="setup" className="stack-md">
          <H2 id="setup">Local setup</H2>
          <p className="text-[13.5px] leading-relaxed text-muted">
            Prerequisites: Python 3.10+ (3.14 supported), Node.js 20+, and a
            machine with a camera for webcam mode.
          </p>

          <Sub>1 · Backend</Sub>
          <Code>{`cd backend
python -m venv .venv            # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt

# the model auto-downloads on first boot, or fetch it explicitly:
python scripts/download_model.py
python scripts/validate_model.py    # optional sanity check

uvicorn app.main:app --reload --port 8000
# → http://localhost:8000/api/health`}</Code>

          <Sub>2 · Frontend</Sub>
          <Code>{`cd frontend
cp .env.example .env.local     # Windows: copy .env.example .env.local
npm install
npm run dev                    # http://localhost:3000`}</Code>

          <p className="text-[13.5px] leading-relaxed text-muted">
            The API status dot in the navbar turns green once{" "}
            <span className="text-frost">/api/health</span> reports the model
            loaded — that is the fastest way to confirm both halves are wired
            together.
          </p>
        </section>

        {/* ----------------------------------------------------------- env */}
        <section aria-labelledby="env" className="stack-md">
          <H2 id="env">Environment variables</H2>

          <div className={`${card} overflow-x-auto`}>
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line">
                  {["Variable", "Where", "Default", "Purpose"].map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ENV_ROWS.map((row) => (
                  <tr key={row.name} className="border-b border-line/60 last:border-0">
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-[12px] text-accent">
                      {row.name}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-[12.5px] text-frost/85">
                      {row.where}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-[11.5px] text-muted">
                      {row.default}
                    </td>
                    <td className="px-5 py-3 text-[13px] leading-relaxed text-muted">
                      {row.purpose}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[13px] leading-relaxed text-muted">
            No value is ever hardcoded in source — URLs and paths come from the
            environment, so the same build works locally and in production.
          </p>
        </section>

        {/* -------------------------------------------------------- deploy */}
        <section aria-labelledby="deploy" className="stack-md">
          <H2 id="deploy">Deployment</H2>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className={`${card} p-5`}>
              <p className={monoChip}>Frontend · Vercel</p>
              <ul className="mt-4 flex flex-col gap-2 text-[13.5px] leading-relaxed text-muted">
                <li>1. Push the repo to GitHub and import it in Vercel.</li>
                <li>
                  2. Root Directory → <span className="text-frost">frontend</span>,
                  framework → Next.js (defaults are fine).
                </li>
                <li>
                  3. Set{" "}
                  <span className="text-accent">NEXT_PUBLIC_API_URL</span> (and{" "}
                  <span className="text-accent">API_BASE_URL</span>) to your
                  backend&rsquo;s public URL.
                </li>
                <li>4. Deploy — every route is statically prerenderable.</li>
              </ul>
            </div>

            <div className={`${card} p-5`}>
              <p className={monoChip}>Backend · Render / Railway / Docker</p>
              <ul className="mt-4 flex flex-col gap-2 text-[13.5px] leading-relaxed text-muted">
                <li>
                  1. The repo ships a{" "}
                  <span className="text-frost">Dockerfile</span> and{" "}
                  <span className="text-frost">render.yaml</span> — point the
                  host at <span className="text-frost">backend/</span>.
                </li>
                <li>
                  2. The 35 MB model is committed, so builds need no external
                  downloads (it can also re-fetch from <span className="text-frost">MODEL_URL</span>).
                </li>
                <li>
                  3. Set <span className="text-accent">ALLOWED_ORIGINS</span> to
                  your Vercel domain.
                </li>
                <li>4. Health check path: /api/health.</li>
              </ul>
            </div>
          </div>

          <div className="rounded-xl border border-warning/30 bg-warning/[0.05] p-5">
            <p className="font-display text-[13.5px] font-semibold text-warning">
              Why the backend isn&rsquo;t on Vercel
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
              Vercel&rsquo;s Python functions are stateless, short-lived and
              size-limited — a 35 MB ONNX model plus OpenCV needs to stay loaded
              in memory between requests to answer in milliseconds, and cold
              starts would dominate latency. Hosting the API on a container
              platform (Render, Railway, Fly.io, a VPS) keeps inference fast
              and the architecture honest; the frontend remains a static Next.js
              build that Vercel serves perfectly.
            </p>
          </div>
        </section>

        {/* --------------------------------------------------- troubleshooting */}
        <section aria-labelledby="trouble" className="stack-md">
          <H2 id="trouble">Troubleshooting</H2>
          <div className={`${card} divide-y divide-line`}>
            {[
              [
                "Status dot red / “backend unreachable”",
                "The API isn’t running or the URL is wrong — start uvicorn and check NEXT_PUBLIC_API_URL matches it (browser devtools → Network).",
              ],
              [
                "Camera button does nothing",
                "Browsers only expose getUserMedia on HTTPS or localhost. Accept the permission prompt, and close other apps holding the camera.",
              ],
              [
                "“status”: “no_face” on every frame",
                "Improve lighting, face the camera squarely, or move closer. Haar cascades need a reasonably frontal, unoccluded face.",
              ],
              [
                "CORS error in the console",
                "Set ALLOWED_ORIGINS on the backend to your exact frontend origin (scheme + domain, no trailing slash).",
              ],
              [
                "503 from /api/predict",
                "The model failed to load at startup — check backend logs, confirm assets/emotion-ferplus-8.onnx exists (or let scripts/download_model.py fetch it).",
              ],
              [
                "Build fails after editing env files",
                "NEXT_PUBLIC_* values are inlined at build time — rebuild after changing them.",
              ],
            ].map(([question, answer]) => (
              <div key={question} className="p-5">
                <p className="font-display text-[13.5px] font-semibold text-frost">
                  {question}
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">{answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className={`${card} mt-14 px-6 py-10 text-center`}>
        <p className="font-display text-lg font-semibold text-frost">
          Done reading? Put it to work.
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <Link href="/dashboard" className="btn btn-primary">
            Open the dashboard
          </Link>
          <Link href="/about" className="btn btn-ghost">
            About the project
          </Link>
        </div>
      </div>
    </div>
  );
}
