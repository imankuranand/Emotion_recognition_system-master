import { Camera, ChartLine, Cpu, ScanFace } from "lucide-react";

const STEPS = [
  {
    icon: Camera,
    title: "Capture",
    body: "Webcam frames, uploaded photos or extracted video frames are encoded in the browser and sent as JPEG payloads.",
    meta: "getUserMedia · canvas",
  },
  {
    icon: ScanFace,
    title: "Detect",
    body: "An OpenCV Haar cascade locates every frontal face and returns bounding boxes in original image coordinates.",
    meta: "haar cascade · multi-scale",
  },
  {
    icon: Cpu,
    title: "Classify",
    body: "Each face crop is resized to 64×64 grayscale and forwarded through the FER+ CNN – softmax over eight emotions.",
    meta: "onnx runtime · cpu",
  },
  {
    icon: ChartLine,
    title: "Visualize",
    body: "Boxes, labels and full probability distributions render on the canvas while every result feeds session analytics.",
    meta: "react · recharts",
  },
];

export function Pipeline() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
      <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="label-chip mb-3">Methodology</p>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-frost">
            Four stages, one request
          </h2>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-muted">
          The exact path a pixel travels – identical for webcam, image and
          video inputs, so behaviour is predictable and testable.
        </p>
      </div>

      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => (
          <li key={step.title} className="glass group relative rounded-2xl p-5 transition-colors duration-200 hover:border-accent/30">
            <div className="mb-4 flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface/80 text-accent transition-colors group-hover:border-accent/40">
                <step.icon className="h-4.5 w-4.5" strokeWidth={1.7} aria-hidden="true" />
              </span>
              <span className="font-mono text-[11px] tracking-[0.2em] text-muted/70">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <h3 className="font-display text-sm font-semibold tracking-wide text-frost">
              {step.title}
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">{step.body}</p>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-accent/70">
              {step.meta}
            </p>
            {index < STEPS.length - 1 && (
              <span
                className="absolute -right-2.5 top-1/2 hidden h-px w-5 bg-gradient-to-r from-accent/60 to-transparent lg:block"
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
