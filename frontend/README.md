# AFFECTRA — Frontend

Next.js 16 (App Router) + Tailwind CSS v4 client for the facial-emotion
backend.

## Run it

```bash
cp .env.example .env.local   # point both URLs at your backend
npm install
npm run dev                  # http://localhost:3000
```

| Variable              | Purpose                                            |
| --------------------- | -------------------------------------------------- |
| `API_BASE_URL`        | Base URL for Next.js **server** code               |
| `NEXT_PUBLIC_API_URL` | Base URL used by the **browser** (`/api/predict`)  |

Both must point at the same FastAPI instance. Rebuild after changing
`NEXT_PUBLIC_*` values — they are inlined at build time.

## Routes

| Route         | What it shows                                              |
| ------------- | ---------------------------------------------------------- |
| `/`           | Landing page: pipeline, emotion classes, tech stack        |
| `/dashboard`  | Webcam / image / video analysis with live probability rail |
| `/analytics`  | Session charts derived purely from real predictions        |
| `/about`      | Project objectives, model card, limitations                |
| `/docs`       | Architecture, API reference, setup & deployment            |

## Structure

```
app/            route segments (pages, error/loading/not-found boundaries)
components/
  landing/      landing-page sections
  detector/     dashboard modes + results rail
  analytics/    charts client
  layout/       navbar, footer, API status
lib/            api client, canvas overlay, session store, media helpers
_drafts/        unfinished experiment, excluded from build (see its README)
```

The full system documentation lives in the repository root `README.md` and
in the app itself at `/docs`.
