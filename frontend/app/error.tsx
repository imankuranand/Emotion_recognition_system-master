"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Route-level error boundary. Rendered by Next.js when a page throws during
 * render or in a server action.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("AFFECTRA route error:", error);
  }, [error]);

  return (
    <main
      id="main"
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "60vh",
        padding: "2rem",
      }}
    >
      <div
        className="glass"
        style={{ maxWidth: "32rem", width: "100%", textAlign: "center" }}
      >
        <AlertTriangle
          size={28}
          aria-hidden="true"
          style={{ color: "var(--danger)", margin: "0 auto 1rem" }}
        />
        <p className="eyebrow">Something broke</p>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>
          We hit an unexpected error
        </h1>
        <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
          Your data is safe. Try loading the page again, or head back to the
          home page.
        </p>

        <div
          className="row"
          style={{ justifyContent: "center", gap: "0.75rem", flexWrap: "wrap" }}
        >
          <button className="btn btn-ghost" onClick={reset}>
            <RotateCcw size={15} aria-hidden="true" /> Try again
          </button>
          <Link className="btn btn-primary" href="/">
            Back to home
          </Link>
        </div>

        {error.digest && (
          <p className="text-muted" style={{ marginTop: "1.25rem", fontSize: "0.75rem" }}>
            Error reference: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
