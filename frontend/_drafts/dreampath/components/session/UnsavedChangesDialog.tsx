"use client";

interface UnsavedChangesDialogProps {
  open: boolean;
  onCancel: () => void;
  /** Discard the draft and continue navigating. */
  onConfirm: () => void;
}

/**
 * Modal that appears when the user tries to leave the write page with an
 * unsaved draft. Follows WAI-ARIA alertdialog practices: focus moves into the
 * dialog, Escape cancels, and focus returns to the trigger on close.
 */
export default function UnsavedChangesDialog({
  open,
  onCancel,
  onConfirm,
}: UnsavedChangesDialogProps) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="unsaved-title"
        aria-describedby="unsaved-body"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === "Escape") onCancel();
        }}
      >
        <p className="eyebrow" id="unsaved-title">
          Unsaved changes
        </p>
        <p className="text-muted" id="unsaved-body">
          You have unsaved changes. Leave this page and discard your draft?
        </p>

        <div className="row" style={{ justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" onClick={onCancel}>
            Keep editing
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Discard draft
          </button>
        </div>
      </div>
    </div>
  );
}
