import { EMOTIONS } from "@/lib/emotions";

export function EmotionGrid() {
  return (
    <section className="border-y border-line bg-abyss/40">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label-chip mb-3">Output space</p>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-frost">
              Eight emotional classes
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted">
            The FER+ model emits a full softmax distribution across all classes
            on every inference – the dashboard shows all eight, not just the
            winner.
          </p>
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {EMOTIONS.map((emotion) => (
            <li
              key={emotion.key}
              className="glass rounded-xl p-4 transition-transform duration-200 hover:-translate-y-0.5"
            >
              <span
                className="mb-3 block h-1.5 w-10 rounded-full"
                style={{ backgroundColor: emotion.color }}
                aria-hidden="true"
              />
              <p className="font-display text-sm font-semibold text-frost">
                {emotion.label}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted/80">
                {emotion.key}
              </p>
              <p className="mt-2 text-[12px] leading-snug text-muted/90">{emotion.hint}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
