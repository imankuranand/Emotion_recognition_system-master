const GROUPS = [
  {
    label: "Frontend",
    items: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS 4", "Recharts", "Lucide"],
  },
  {
    label: "Backend & ML",
    items: ["FastAPI", "ONNX Runtime", "OpenCV", "NumPy", "Uvicorn", "Pydantic"],
  },
  {
    label: "Model",
    items: ["FER+ CNN", "8-way softmax", "64×64 grayscale", "Haar cascade"],
  },
  {
    label: "Platform",
    items: ["Vercel", "Render / Docker", "GitHub", "REST + JSON"],
  },
];

export function TechStack() {
  return (
    <section className="border-t border-line bg-abyss/40">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
        <div className="mb-10">
          <p className="label-chip mb-3">Technology stack</p>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-frost">
            Chosen for the workload
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            TensorFlow transfer learning from the original repository is
            preserved as the documented training pipeline under{" "}
            <code className="font-mono text-[12px] text-accent">/training</code>;
            inference is served through ONNX Runtime because it fits real
            hosting limits – small wheels, fast cold starts, CPU-friendly.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GROUPS.map((group) => (
            <div key={group.label} className="glass rounded-2xl p-5">
              <p className="label-chip mb-4">{group.label}</p>
              <ul className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-md border border-line bg-surface/70 px-2.5 py-1.5 font-mono text-[11px] tracking-wider text-muted transition-colors hover:border-accent/40 hover:text-frost"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
