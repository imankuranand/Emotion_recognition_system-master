"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DeleteSessionButtonProps {
  id: string;
  /** Icon-only variant used inside the timeline rail. */
  compact?: boolean;
}

export default function DeleteSessionButton({
  id,
  compact = false,
}: DeleteSessionButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setBusy(true);
    setError(null);

    try {
      const response = await fetch(`/api/sessions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Could not delete this session.");
      }

      router.push("/session");
      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Something went wrong.",
      );
      setBusy(false);
      setOpen(false);
    }
  }

  if (!open) {
    return (
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => setOpen(true)}
        aria-label="Delete this session"
        title="Delete session"
        style={compact ? { padding: "0.35rem" } : undefined}
      >
        <Trash2 size={14} aria-hidden="true" />
        {!compact && "Delete session"}
      </button>
    );
  }

  return (
    <div className="glass" style={{ padding: "1rem" }}>
      <p style={{ fontWeight: 600, marginBottom: "0.35rem" }}>
        Delete this session?
      </p>
      <p className="text-muted" style={{ marginBottom: "0.85rem", fontSize: "0.86rem" }}>
        The dream record and its interpretation will be removed permanently.
      </p>

      {error && (
        <p className="form-error" role="alert" style={{ marginBottom: "0.6rem" }}>
          {error}
        </p>
      )}

      <div className="row" style={{ justifyContent: "flex-end" }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
          Cancel
        </button>
        <button
          className="btn btn-danger btn-sm"
          onClick={handleDelete}
          disabled={busy}
        >
          {busy ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}
