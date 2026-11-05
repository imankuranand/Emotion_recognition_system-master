/**
 * Typed client for the FastAPI ML backend.
 *
 * The base URL comes exclusively from `NEXT_PUBLIC_API_URL` – never hardcoded
 * – so the same build works locally and on Vercel.
 */

import type { HealthResponse, ModelInfoResponse, PredictionResponse } from "./types";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

export class ApiError extends Error {
  /** HTTP status, or 0 when the request never reached the server. */
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface RequestOptions {
  method?: "GET" | "POST";
  body?: BodyInit | null;
  headers?: Record<string, string>;
  timeoutMs?: number;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers, timeoutMs = 20_000 } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      body,
      headers,
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      let detail = `Request failed with status ${response.status}.`;
      try {
        const payload = (await response.json()) as { detail?: string };
        if (typeof payload.detail === "string") detail = payload.detail;
      } catch {
        /* non-JSON error body – keep generic message */
      }
      throw new ApiError(detail, response.status);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(
        "The AI backend did not respond in time. Please try again.",
        0,
      );
    }
    throw new ApiError(
      `Cannot reach the AI backend at ${API_BASE_URL}. Check that it is running and reachable.`,
      0,
    );
  } finally {
    clearTimeout(timer);
  }
}

/* ------------------------------------------------------------------ */
/* Endpoints                                                          */
/* ------------------------------------------------------------------ */

export function getHealth(timeoutMs = 8_000): Promise<HealthResponse> {
  return request<HealthResponse>("/api/health", { timeoutMs });
}

export function getModelInfo(): Promise<ModelInfoResponse> {
  return request<ModelInfoResponse>("/api/model");
}

export function predictImage(
  blob: Blob,
  fileName = "capture.jpg",
  timeoutMs = 30_000,
): Promise<PredictionResponse> {
  const form = new FormData();
  form.append("file", blob, fileName);
  return request<PredictionResponse>("/api/predict", {
    method: "POST",
    body: form,
    timeoutMs,
  });
}

/** Human-readable message for any thrown error. */
export function describeError(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred.";
}
