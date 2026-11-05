"use client";

import { emotionMeta } from "@/lib/emotions";

/**
 * Full softmax distribution for one face, sorted descending.
 * Animated widths keep the display smooth at webcam inference rates.
 */
export function ProbabilityBars({
  probabilities,
  compact = false,
}: {
  probabilities: Record<string, number>;
  compact?: boolean;
}) {
  const entries = Object.entries(probabilities).sort(([, a], [, b]) => b - a);

  return (
    <ul className={compact ? "space-y-1.5" : "space-y-2.5"}>
      {entries.map(([label, value]) => {
        const meta = emotionMeta(label);
        const percent = value * 100;
        const isTop = entries[0]?.[0] === label;

        return (
          <li key={label} className="grid grid-cols-[86px_1fr_44px] items-center gap-2.5">
            <span
              className={`truncate font-display text-[11px] tracking-wide ${
                isTop ? "font-semibold" : "font-medium"
              }`}
              style={{ color: isTop ? meta.color : undefined }}
              title={meta.label}
            >
              <span
                className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle"
                style={{ backgroundColor: meta.color }}
                aria-hidden="true"
              />
              <span className={isTop ? "" : "text-muted"}>{meta.label}</span>
            </span>
            <span
              className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]"
              role="meter"
              aria-valuenow={Math.round(percent)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${meta.label} probability`}
            >
              <span
                className="block h-full rounded-full transition-[width] duration-500 ease-out"
                style={{
                  width: `${Math.max(percent, 1.2)}%`,
                  backgroundColor: meta.color,
                  opacity: isTop ? 1 : 0.55,
                }}
              />
            </span>
            <span
              className={`text-right font-mono text-[10.5px] ${isTop ? "text-frost" : "text-muted"}`}
            >
              {percent.toFixed(1)}%
            </span>
          </li>
        );
      })}
    </ul>
  );
}
