# AFFECTRA — Facial Emotion Recognition System

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.162-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![ONNX Runtime](https://img.shields.io/badge/ONNX%20Runtime-1.31-005CED?logo=onnx&logoColor=white)](https://onnxruntime.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A production-shaped, full-stack facial emotion recognition web app built as a
third-year B.Tech capstone project. The browser captures webcam frames, photos
or video frames, sends them to a FastAPI backend that detects faces (OpenCV
Haar cascade) and classifies each face into **8 emotion classes** with an
ONNX-compiled **FER+** network, then folds every real prediction into
session-level analytics. No mocked or hardcoded predictions anywhere.

> **Honest by design** — every chart, percentage and stat in the UI is
> aggregated from actual `/api/predict` responses. If the backend is down, the
> UI says so instead of inventing numbers.

---

## Repository layout

```
.
├── backend/                  FastAPI + ONNX Runtime inference service
│   ├── app/
│   │   ├── main.py           app factory, CORS, lifespan (model load)
│   │   ├── config.py         every tunable is an env var
│   │   ├── routers/          GET /, /api/health, /api/model, /api/config · POST /api/predict
│   │   └── ml/               detector (Haar), engine (ONNX), pipeline
│   ├── assets/               emotion-ferplus-8.onnx (35 MB) + cascade XML
│   ├── scripts/              download_model.py, validate_model.py
│   ├── Dockerfile            container image for Render / Railway / any host
│   └── requirements.txt
├── frontend/                 Next.js 16 + Tailwind CSS v4 (Vercel target)
│   ├── app/                  routes: / /dashboard /analytics /about /docs
│   ├── components/           landing, detector, analytics, layout
│   ├── lib/                  api client, canvas overlay, session store
│   └── README.md             frontend-specific docs
├── training/                 preserved legacy TensorFlow 1.x retraining pipeline
│   ├── retrain.py            original transfer-learning script
│   ├── label_image.py        TF inference helper for the legacy graph
│   ├── recognition_webcam.py / android_recognition.py   legacy demos
│   └── Face_crop.py          legacy face-cropping utility
├── render.yaml               Render blueprint for the backend (Docker)
└── LICENSE                   MIT
```

---

## Architecture

```
BROWSER (Vercel)                     BACKEND (Render / Railway / Docker)
┌─────────────────────────┐          ┌──────────────────────────────┐
│ Next.js 16 App Router   │  POST    │ FastAPI (uvicorn)            │
│ · webcam / image / video├─────────►│ · Haar cascade detection     │
│ · canvas overlay        │  JPEG    │ · 64×64 grayscale crop       │
│ · session → analytics   │  ◄────── │ · ONNX Runtime FER+ inference│
└─────────────────────────┘   JSON   └──────────────────────────────┘
```

The browser never touches the model — it ships pixels and draws what comes
back. Full details live in-app at **`/docs`**.

### API contract (summary)

| Method | Path            | Purpose                                              |
| ------ | --------------- | ---------------------------------------------------- |
| GET    | `/`             | Service name / version                               |
| GET    | `/api/health`   | Readiness probe (model + detector loaded)            |
| GET    | `/api/model`    | Model card: input size, preprocessing, source        |
| GET    | `/api/config`   | Non-sensitive runtime config                         |
| POST   | `/api/predict`  | multipart `file` → boxes + softmax probabilities     |

`POST /api/predict` returns **200** with `status: "no_face"` when no face is
found (the UI distinguishes that from a failed request). Errors: `415` wrong
media type · `413` too large · `422` undecodable file · `503` model not loaded.

---

## Local development

### Prerequisites

- **Python 3.10+** and **Node.js 20+**
- No GPU required — inference runs on CPU (~50 ms/frame)

### 1. Backend

```powershell
cd backend
python -m venv ..\.venv-backend          # or any venv you like
..\..\.venv-backend\Scripts\activate      # adjust to your venv path
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The 35 MB ONNX model is **committed** in `backend/assets/`, so no download is
needed. If it's ever missing, the app fetches it from `MODEL_URL` at startup
(`python scripts/download_model.py` does the same manually).

Verify: <http://localhost:8000/api/health>

### 2. Frontend

```powershell
cd frontend
copy .env.example .env.local     # then edit URLs if needed
npm install
npm run dev                      # http://localhost:3000
```

| Variable              | Purpose                                            |
| --------------------- | -------------------------------------------------- |
| `API_BASE_URL`        | Base URL for Next.js **server** code               |
| `NEXT_PUBLIC_API_URL` | Base URL used by the **browser** (`/api/predict`)  |

Both must point at the same FastAPI instance. `NEXT_PUBLIC_*` values are
inlined at **build** time — rebuild after changing them.

### Quality gates

```powershell
cd frontend
npm run lint          # ESLint
npx tsc --noEmit      # type check
npm run build         # production build (all routes prerender)
```

---

## Deploying

The system is split into two deployable units on purpose: **Vercel hosts the
frontend**, and the **Python backend runs on Render/Railway/any Docker
host** — Vercel's serverless functions are not a good fit for a long-lived
ONNX session + OpenCV process (cold starts, 10–50 MB payload limits, CPU
timeouts). Both are free-tier friendly.

### Step 1 — Backend on Render (Docker)

1. Push this repository to GitHub.
2. In [Render](https://dashboard.render.com) → **New → Blueprint**, select the
   repo. Render picks up the committed `render.yaml`:
   - Docker image built from `backend/Dockerfile`
     (context `backend/`, so the 35 MB model is baked into the image),
   - health check at `/api/health`.
3. Set **`ALLOWED_ORIGINS`** to your frontend's exact origin(s), comma
   separated, e.g. `https://your-app.vercel.app` (scheme + domain, no trailing
   slash). Add `http://localhost:3000` for local testing.
4. Deploy. Note your service URL, e.g. `https://affectra-api.onrender.com`.

> Railway, Fly.io, or any Docker host work too — build with
> `docker build -t affectra-api backend/` and run it; only `ALLOWED_ORIGINS`
> and `PORT` need configuring.

### Step 2 — Frontend on Vercel

1. In [Vercel](https://vercel.com/new) → **Add New → Project**, import the
   same repo.
2. Set **Root Directory** → `frontend` (framework is auto-detected as Next.js;
   build command `npm run build` and output are defaults).
3. Add the environment variables:
   - `NEXT_PUBLIC_API_URL` = your Render URL (e.g. `https://affectra-api.onrender.com`)
   - `API_BASE_URL` = same value
4. **Deploy.** Every route is statically prerendered at build time, so pages
   serve from the edge; only the `/api/predict` calls hit your backend.

> Local `.env.local` is git-ignored — Vercel reads its values from the
> project settings, never from the repo.

### Step 3 — Verify

- `GET https://<your-backend>/api/health` → `"status": "ok"`
- The navbar dot on your Vercel URL turns green (**API Online**)
- Run one image analysis and one analytics refresh

### Why the backend isn't on Vercel

| Concern                | Vercel serverless        | Render/Railway Docker        |
| ---------------------- | ------------------------ | ---------------------------- |
| ONNX session + OpenCV  | re-created per cold start | persistent process           |
| 35 MB model in bundle  | exceeds function limits   | baked into image             |
| CPU-heavy inference    | per-request time budget   | runs as long as needed       |
| Long-lived connections | not supported             | native                       |

The frontend itself uses no Vercel-specific APIs — it would also run on
Netlify, Cloudflare Pages, or `next start` behind any reverse proxy.

---

## The model

- **emotion-ferplus-8.onnx** (35 MB, committed in `backend/assets/`)
- ONNX Model Zoo *Emotion FERPlus* — compact CNN trained on the FERPlus
  relabeling of FER2013 (Kaggle, 2013)
- Input: `[1, 1, 64, 64]` float32, **raw grayscale 0–255** (the graph
  normalises internally), output: softmax over 8 classes:
  `neutral, happiness, sadness, surprise, fear, disgust, anger, contempt`
- Detection: OpenCV `haarcascade_frontalface_default`, run on a **4×
  downscaled** copy for speed, boxes scaled back and clipped (max 8 faces)
- Warm latency: ~45 ms detect + ~48 ms inference per frame (CPU)

Validate the asset any time:

```powershell
cd backend
..\..\.venv-backend\Scripts\python.exe scripts\validate_model.py
```

### Retraining (legacy pipeline)

The original TensorFlow 1.x transfer-learning pipeline is preserved unchanged
in [`training/`](training/) — `retrain.py`, `label_image.py`, the webcam demos
and the reference cascade files. It requires TensorFlow 1.x and your own
labelled image folders; see the historical notes in that folder. The shipped
web app does **not** depend on it — it runs the pretrained ONNX model.

---

## Privacy

Frames are processed in memory and never written to disk or a database. The
analytics session lives in browser memory and dies with the tab. No cookies,
no tracking, no third-party analytics.

## License

[MIT](LICENSE) — © 2018 Kushal Bhavsar (original repository). FER+ model:
Apache-2.0 (ONNX Model Zoo).
