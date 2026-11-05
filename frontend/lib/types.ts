/**
 * Types mirroring the FastAPI response schemas (`backend/app/schemas.py`).
 * Keep this file in sync with the backend contract.
 */

export const EMOTION_LABELS = [
  "neutral",
  "happiness",
  "surprise",
  "sadness",
  "anger",
  "disgust",
  "fear",
  "contempt",
] as const;

export type Emotion = (typeof EMOTION_LABELS)[number];

/** x, y, w, h in original image pixel coordinates */
export type Box = [number, number, number, number];

export interface FacePrediction {
  box: Box;
  emotion: Emotion;
  confidence: number;
  emotion_index: number;
  probabilities: Record<Emotion, number>;
}

export interface PredictionResponse {
  status: "ok" | "no_face";
  face_count: number;
  faces: FacePrediction[];
  width: number;
  height: number;
  detection_ms: number;
  inference_ms: number;
  model: string;
}

export interface HealthResponse {
  status: "ok" | "degraded";
  model_loaded: boolean;
  detector_loaded: boolean;
  model: string;
  classes: string[];
  version: string;
}

export interface ModelInfoResponse {
  model: string;
  full_name: string;
  source: string;
  paper: string;
  classes: string[];
  input_size: number;
  preprocess: string;
  face_detector: string;
  framework: string;
}

/* ------------------------------------------------------------------ */
/* Session analytics (client-side, derived from real predictions only) */
/* ------------------------------------------------------------------ */

export type DetectionSource = "webcam" | "image" | "video";

export interface DetectionRecord {
  id: string;
  timestamp: number;
  source: DetectionSource;
  /** Dominant emotion of the most confident face in this analysis */
  emotion: Emotion;
  confidence: number;
  faceCount: number;
  probabilities: Record<Emotion, number>;
  inferenceMs: number;
  /** Optional contextual label, e.g. "00:12" for video frames */
  label?: string;
}

export interface SessionStats {
  totalAnalyses: number;
  totalFaces: number;
  averageConfidence: number;
  averageInferenceMs: number;
  topEmotion: Emotion | null;
  distribution: Record<Emotion, number>;
  averageConfidenceByEmotion: Record<Emotion, number | null>;
  bySource: Record<DetectionSource, number>;
}
