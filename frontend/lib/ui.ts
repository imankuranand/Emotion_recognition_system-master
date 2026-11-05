/**
 * Shared class recipes – keeps visual language consistent without
 * duplicating long Tailwind strings across components.
 */

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 " +
  "font-display text-sm font-semibold tracking-wide text-abyss " +
  "transition-all duration-200 hover:bg-white hover:shadow-[0_0_28px_rgba(34,211,238,0.35)] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-ink disabled:cursor-not-allowed disabled:opacity-50";

export const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-line px-5 py-2.5 " +
  "font-display text-sm font-semibold tracking-wide text-frost/90 " +
  "transition-all duration-200 hover:border-accent/50 hover:text-accent " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-50";

export const card = "glass rounded-2xl";

export const cardStrong = "glass-strong panel-glow rounded-2xl";

export const monoChip =
  "inline-flex items-center gap-1.5 rounded-md border border-line bg-surface/70 " +
  "px-2 py-1 font-mono text-[11px] tracking-wider text-muted";

export const pageShell = "mx-auto w-full max-w-6xl px-5 sm:px-8";
