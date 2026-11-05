"use client";

/**
 * Session-scoped detection history.
 *
 * Every record originates from a real backend response – the analytics page
 * only ever renders this data, so no chart can show fabricated results.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { EMOTION_LABELS } from "./types";
import type {
  DetectionRecord,
  DetectionSource,
  Emotion,
  SessionStats,
} from "./types";

const MAX_RECORDS = 500;

function emptyDistribution(): Record<Emotion, number> {
  return Object.fromEntries(EMOTION_LABELS.map((label) => [label, 0])) as Record<
    Emotion,
    number
  >;
}

export interface NewDetection {
  source: DetectionSource;
  emotion: Emotion;
  confidence: number;
  faceCount: number;
  probabilities: Record<Emotion, number>;
  inferenceMs: number;
  label?: string;
}

interface SessionContextValue {
  records: DetectionRecord[];
  stats: SessionStats;
  addDetection: (detection: NewDetection) => void;
  clearSession: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

let counter = 0;

export function SessionProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<DetectionRecord[]>([]);

  const addDetection = useCallback((detection: NewDetection) => {
    const record: DetectionRecord = {
      ...detection,
      id: `d${Date.now()}-${counter += 1}`,
      timestamp: Date.now(),
    };
    setRecords((previous) => {
      const next = [...previous, record];
      return next.length > MAX_RECORDS ? next.slice(next.length - MAX_RECORDS) : next;
    });
  }, []);

  const clearSession = useCallback(() => setRecords([]), []);

  const stats = useMemo<SessionStats>(() => {
    const distribution = emptyDistribution();
    const confidenceSumByEmotion = emptyDistribution() as Record<Emotion, number>;
    const countByEmotion = emptyDistribution();
    const bySource: Record<DetectionSource, number> = { webcam: 0, image: 0, video: 0 };

    let totalFaces = 0;
    let confidenceSum = 0;
    let inferenceSum = 0;

    for (const record of records) {
      distribution[record.emotion] += 1;
      countByEmotion[record.emotion] += 1;
      confidenceSumByEmotion[record.emotion] += record.confidence;
      bySource[record.source] += 1;
      totalFaces += record.faceCount;
      confidenceSum += record.confidence;
      inferenceSum += record.inferenceMs;
    }

    const count = records.length;
    let topEmotion: Emotion | null = null;
    let topCount = 0;
    for (const label of EMOTION_LABELS) {
      if (distribution[label] > topCount) {
        topCount = distribution[label];
        topEmotion = label;
      }
    }

    const averageConfidenceByEmotion = Object.fromEntries(
      EMOTION_LABELS.map((label) => [
        label,
        countByEmotion[label] > 0
          ? confidenceSumByEmotion[label] / countByEmotion[label]
          : null,
      ]),
    ) as Record<Emotion, number | null>;

    return {
      totalAnalyses: count,
      totalFaces,
      averageConfidence: count > 0 ? confidenceSum / count : 0,
      averageInferenceMs: count > 0 ? inferenceSum / count : 0,
      topEmotion: topCount > 0 ? topEmotion : null,
      distribution,
      averageConfidenceByEmotion,
      bySource,
    };
  }, [records]);

  const value = useMemo(
    () => ({ records, stats, addDetection, clearSession }),
    [records, stats, addDetection, clearSession],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used inside <SessionProvider>");
  }
  return context;
}
