import {
  Activity,
  Aperture,
  Boxes,
  ChartColumn,
  Film,
  ShieldCheck,
} from "lucide-react";

const FEATURES = [
  {
    icon: Aperture,
    title: "Three input modes",
    body: "Live webcam detection, drag-and-drop image upload and frame-by-frame video analysis in one dashboard.",
  },
  {
    icon: Activity,
    title: "Real-time overlays",
    body: "Bounding boxes, emotion labels and confidence chips are drawn on canvas coordinates returned by the API.",
  },
  {
    icon: Boxes,
    title: "Full distributions",
    body: "Every response carries the complete eight-class softmax vector, so downstream charts are mathematically faithful.",
  },
  {
    icon: ChartColumn,
    title: "Session analytics",
    body: "Emotion distribution, confidence trends, history and top-emotion statistics computed from your actual detections.",
  },
  {
    icon: ShieldCheck,
    title: "Validated inference",
    body: "Input preprocessing was verified against the model graph itself (internal (x−127.5)/255 normalisation) and tested empirically.",
  },
  {
    icon: Film,
    title: "Deployment ready",
    body: "Environment-driven configuration, Dockerised backend and a Vercel-optimised frontend – no local-only assumptions.",
  },
];

export function Features() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
      <div className="mb-10">
        <p className="label-chip mb-3">Capabilities</p>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-frost">
          Engineered like a product
        </h2>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <li key={feature.title} className="glass rounded-2xl p-5 transition-colors duration-200 hover:border-accent/30">
            <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface/80 text-accent">
              <feature.icon className="h-4.5 w-4.5" strokeWidth={1.7} aria-hidden="true" />
            </span>
            <h3 className="font-display text-sm font-semibold tracking-wide text-frost">
              {feature.title}
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">{feature.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
