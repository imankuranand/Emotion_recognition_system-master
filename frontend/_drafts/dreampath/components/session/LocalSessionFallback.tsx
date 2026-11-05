"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { FileQuestion } from "lucide-react";

import type { DreamSession } from "@/lib/types";
import { getSession } from "@/lib/local-data";
import SessionRecordView from "@/components/session/SessionRecordView";

const subscribe = () => () => {};

interface LookupProps {
  id: string;
}

/**
 * Fallback used when the server-side API lookup misses (backend offline, or
 * the record only exists in this browser's local storage).
 *
 * localStorage can only be read in the browser, so the server snapshot is
 * `false`; React hydrates with the same value and swaps in the client result
 * before paint, avoiding hydration mismatches.
 */
export default function LocalSessionFallback({ id }: LookupProps) {
  const found = useSyncExternalStore(
    subscribe,
    () => getSession(id) !== null,
    () => false,
  );

  if (found) {
    return <SessionRecordView record={getSession(id) as DreamSession} />;
  }

  return (
    <main
      id="main"
      className="container"
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "70vh",
        padding: "8rem 2rem 4rem",
      }}
    >
      <div
        className="glass"
        style={{ maxWidth: "30rem", width: "100%", textAlign: "center", padding: "2rem" }}
      >
        <FileQuestion
          size={26}
          aria-hidden="true"
          style={{ color: "var(--accent)", margin: "0 auto 1rem" }}
        />
        <p className="eyebrow">Record not found</p>
        <h1 style={{ fontSize: "1.4rem", marginBottom: "0.6rem" }}>
          This session doesn&apos;t exist
        </h1>
        <p className="text-muted" style={{ marginBottom: "1.4rem" }}>
          It may have been deleted, it was saved in a different browser, or
          the backend is offline.
        </p>
        <div className="row" style={{ justifyContent: "center", gap: "0.75rem" }}>
          <Link href="/session" className="btn btn-primary">
            Back to timeline
          </Link>
          <Link href="/session/write" className="btn btn-ghost">
            Write a dream
          </Link>
        </div>
      </div>
    </main>
  );
}
