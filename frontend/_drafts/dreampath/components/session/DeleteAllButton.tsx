"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteAllButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/sessions", { method: "DELETE" });

      if (!response.ok) {
        throw new Error("Failed to delete saved sessions.");
      }

      router.refresh();
      router.push("/");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Something went wrong.",
      );
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button className="btn btn-ghost" onClick={() => setOpen(true)}>
        Delete all sessions
      </button>
    );
  }

  return (
    <div className="glass" style={{ padding: "1.25rem" }}>
      <p style={{ fontWeight: 600, marginBottom: "0.35rem" }}>
        Delete every saved session?
      </p>
      <p className="text-muted" style={{ marginBottom: "1rem" }}>
        This removes all dream records stored in this browser. It cannot be
        undone.
      </p>

      {error && (
        <p className="form-error" role="alert" style={{ marginBottom: "0.75rem" }}>
          {error}
        </p>
      )}

      <div className="row" style={{ justifyContent: "flex-end" }}>
        <button className="btn btn-ghost" onClick={() => setOpen(false)}>
          Cancel
        </button>
        <button
          className="btn btn-danger"
          onClick={handleDelete}
          disabled={busy}
        >
          {busy ? "Deleting..." : "Delete everything"}
        </button>
      </div>
    </div>
  );
}
