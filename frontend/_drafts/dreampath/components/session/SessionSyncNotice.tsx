"use client";

import { Cloud, CloudOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import type { DreamSession } from "@/lib/types";

type SyncState = "idle" | "syncing" | "synced" | "local" | "error";

/**
 * Client-side fallback for records that only exist in the visitor's local
 * storage (i.e. the API was unreachable when the page was rendered). Tries to
 * push the queued record to the backend and reports the outcome.
 */
export default function SessionSyncNotice({ record }: { record: DreamSession }) {
  const [state, setState] = useState<SyncState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function sync() {
      if (!record.queued) {
        setState(navigator.onLine ? "synced" : "local");
        return;
      }

      if (!navigator.onLine) {
        setState("local");
        return;
      }

      setState("syncing");

      try {
        const response = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...record, queued: false }),
        });

        if (!response.ok) throw new Error("rejected");

        if (!cancelled) {
          setState("synced");
          setMessage("Synced to the server.");
        }
      } catch {
        if (!cancelled) {
          setState("error");
          setMessage("Backend unreachable — this record stays in the browser.");
        }
      }
    }

    void sync();
    return () => {
      cancelled = true;
    };
  }, [record]);

  if (state === "idle") return null;

  const icon =
    state === "syncing" ? (
      <Loader2 size={13} className="spin" aria-hidden="true" />
    ) : state === "error" || state === "local" ? (
      <CloudOff size={13} aria-hidden="true" />
    ) : (
      <Cloud size={13} aria-hidden="true" />
    );

  const label =
    message ??
    (state === "syncing"
      ? "Syncing with the server..."
      : state === "synced"
        ? "Available on the server."
        : "Stored in this browser only.");

  return (
    <p
      role="status"
      className="text-muted row"
      style={{ gap: "0.4rem", fontSize: "0.78rem", marginTop: "1.25rem" }}
    >
      {icon} {label}
    </p>
  );
}
