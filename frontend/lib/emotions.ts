/**
 * Presentation metadata for the eight FER+ emotion classes.
 * Colours are shared by bounding boxes, charts and badges so the whole
 * product stays visually consistent.
 */

import type { Emotion } from "./types";

export interface EmotionMeta {
  key: Emotion;
  label: string;
  /** Core chart/box colour */
  color: string;
  /** Softer variant for backgrounds */
  soft: string;
  /** One-line description used on the landing page */
  hint: string;
}

export const EMOTIONS: EmotionMeta[] = [
  { key: "neutral", label: "Neutral", color: "#94a3b8", soft: "rgba(148,163,184,0.14)", hint: "Relaxed, baseline expression" },
  { key: "happiness", label: "Happiness", color: "#34d399", soft: "rgba(52,211,153,0.14)", hint: "Smiling, positive valence" },
  { key: "surprise", label: "Surprise", color: "#facc15", soft: "rgba(250,204,21,0.14)", hint: "Sudden, wide-eyed reaction" },
  { key: "sadness", label: "Sadness", color: "#38bdf8", soft: "rgba(56,189,248,0.14)", hint: "Lowered affect, grief" },
  { key: "anger", label: "Anger", color: "#f87171", soft: "rgba(248,113,113,0.14)", hint: "Tensed, high arousal" },
  { key: "disgust", label: "Disgust", color: "#a3e635", soft: "rgba(163,230,53,0.14)", hint: "Aversion response" },
  { key: "fear", label: "Fear", color: "#c084fc", soft: "rgba(192,132,252,0.14)", hint: "Threat-oriented reaction" },
  { key: "contempt", label: "Contempt", color: "#fb923c", soft: "rgba(251,146,60,0.14)", hint: "Asymmetric, dismissive" },
];

const EMOTION_MAP = new Map(EMOTIONS.map((meta) => [meta.key, meta]));

export function emotionMeta(key: string): EmotionMeta {
  return (
    EMOTION_MAP.get(key as Emotion) ?? {
      key: "neutral",
      label: key.charAt(0).toUpperCase() + key.slice(1),
      color: "#94a3b8",
      soft: "rgba(148,163,184,0.14)",
      hint: "",
    }
  );
}

export function emotionColor(key: string): string {
  return emotionMeta(key).color;
}

export function titleCase(key: string): string {
  return emotionMeta(key).label;
}
