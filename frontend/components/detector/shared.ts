import type { DetectionSource, PredictionResponse } from "@/lib/types";

/** The three ways media can reach the model. */
export type AnalysisMode = DetectionSource;

/** Props every mode panel receives from the dashboard shell. */
export interface ModeProps {
  /** Deliver a backend response to the shell (updates results + analytics). */
  onResult: (result: PredictionResponse, label?: string) => void;
  /** Toggle the shared "analysis in progress" flag. */
  onBusyChange: (busy: boolean) => void;
  /** Surface a fatal error in the results rail (null clears it). */
  onError: (message: string | null) => void;
  /** Clear the current result when the analysed media changes. */
  onReset: () => void;
}
