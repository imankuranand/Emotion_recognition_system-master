"use client";

import { useEffect, useState } from "react";
import { getHealth } from "@/lib/api";
import type { HealthResponse } from "@/lib/types";

type Status = "checking" | "online" | "offline";

const POLL_INTERVAL_MS = 20_000;

/**
 * Live connection indicator for the ML backend.
 * Polls `/api/health` and reflects readiness (model loaded or not).
 */
export function ApiStatus({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<Status>("checking");
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const result = await getHealth();
        if (cancelled) return;
        setHealth(result);
        setStatus(result.model_loaded ? "online" : "offline");
      } catch {
        if (!cancelled) setStatus("offline");
      }
    }

    check();
    const timer = setInterval(check, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const config = {
    checking: {
      dot: "bg-warning",
      label: "Connecting",
      ring: "border-warning/30 text-warning",
    },
    online: {
      dot: "bg-success animate-pulse-soft",
      label: compact ? "API Online" : `API Online · ${health?.model ?? ""}`,
      ring: "border-success/30 text-success",
    },
    offline: {
      dot: "bg-danger animate-pulse-soft",
      label: "API Offline",
      ring: "border-danger/30 text-danger",
    },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-display text-[11px] tracking-wider ${config.ring}`}
      role="status"
      aria-live="polite"
      title={
        status === "online"
          ? `Backend healthy · model ${health?.model} · v${health?.version}`
          : status === "offline"
            ? "Backend unreachable – detections are disabled"
            : "Checking backend availability…"
      }
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
