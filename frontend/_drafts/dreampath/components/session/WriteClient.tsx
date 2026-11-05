"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Compass,
  Loader2,
  Sparkles,
} from "lucide-react";

import type {
  DreamInterpretation,
  DreamSession,
  EmotionValue,
} from "@/lib/types";
import { emotionEmoji } from "@/lib/emotions";
import {
  getAllSessions,
  queueSession,
  saveSession,
} from "@/lib/local-data";
import { syncQueue } from "@/lib/sync";
import SaveButton from "@/components/session/SaveButton";
import TimelineRail from "@/components/session/TimelineRail";
import UnsavedChangesDialog from "@/components/session/UnsavedChangesDialog";
import NavigationGuard from "@/components/session/NavigationGuard";
import { DraftGuardProvider } from "@/components/session/guard";

const STORAGE_KEY = "dreampath:draft";

function loadDraft(): { text: string; interpretation: DreamInterpretation } | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.text !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

export default function WriteClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [text, setText] = useState("");
  const [interpretation, setInterpretation] =
    useState<DreamInterpretation | null>(null);
  const [saved, setSaved] = useState<DreamSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [pendingNav, setPendingNav] = useState<null | (() => void)>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);

  const restoreAttempted = useRef(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const [sessions, setSessions] = useState<DreamSession[]>([]);

  const refreshSessions = useCallback(() => {
    setSessions(getAllSessions());
  }, []);

  /** True when there is work the user would lose by navigating away. */
  const isDirty = dirty && (interpretation !== null || text.trim().length > 0);

  // --- Draft restore + query-param prefill -------------------------------
  useEffect(() => {
    if (restoreAttempted.current) return;
    restoreAttempted.current = true;

    const paramDream = searchParams.get("dream");
    if (paramDream) {
      setText(paramDream);
      setDirty(true);
      setRestored(false);
    } else {
      const draft = loadDraft();
      if (draft && draft.text) {
        setText(draft.text);
        setInterpretation(draft.interpretation ?? null);
        setRestored(true);
      }
    }

    refreshSessions();
  }, [searchParams, refreshSessions]);

  // --- Persist draft ------------------------------------------------------
  useEffect(() => {
    if (!dirty) return;
    try {
      if (!text.trim()) {
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ text, interpretation }),
        );
      }
    } catch {
      // Storage full/blocked: the unsaved-changes guard still protects the user.
    }
  }, [text, interpretation, dirty]);

  // --- Browser close/reload guard ----------------------------------------
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const clearDraft = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setDirty(false);
    setSaved(null);
    setRestored(false);
  }, []);

  const discardDraft = useCallback(() => {
    setText("");
    setInterpretation(null);
    setError(null);
    setSaveError(null);
    setShowErrors(false);
    clearDraft();
  }, [clearDraft]);

  const textError =
    text.trim().length === 0
      ? "Describe your dream before interpreting it."
      : text.trim().length < 20
        ? "Please write at least 20 characters so the interpretation has something to work with."
        : null;

  // --- Interpret ----------------------------------------------------------
  async function handleInterpret(event: React.FormEvent) {
    event.preventDefault();
    setShowErrors(true);
    setSaveError(null);

    if (textError) {
      errorRef.current?.focus();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dream_text: text }),
      });

      if (!response.ok) {
        const detail = await response
          .json()
          .then((body) => body?.detail)
          .catch(() => null);

        throw new Error(
          typeof detail === "string"
            ? detail
            : "The interpreter could not process this dream. Please try again.",
        );
      }

      const data: DreamInterpretation = await response.json();
      setInterpretation(data);
      setSaved(null);

      requestAnimationFrame(() => {
        resultRef.current?.focus();
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong while interpreting. Please try again.",
      );
      requestAnimationFrame(() => {
        errorRef.current?.focus();
      });
    } finally {
      setLoading(false);
    }
  }

  // --- Save ---------------------------------------------------------------
  async function handleSave(): Promise<DreamSession | null> {
    if (!interpretation) return null;

    setSaveError(null);

    const record: DreamSession = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      created_at: new Date().toISOString(),
      dream_text: text,
      interpretation,
      dominant_emotion: interpretation.dominant_emotion,
      queued: false,
    };

    const online = typeof navigator !== "undefined" ? navigator.onLine : true;

    try {
      if (online) {
        const response = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(record),
        });

        if (!response.ok) {
          throw new Error("The server rejected this session.");
        }

        const savedRecord: DreamSession = await response.json();
        saveSession(savedRecord);
        setSaved(savedRecord);
        setDirty(false);
        refreshSessions();
        return savedRecord;
      }

      queueSession(record);
      syncQueue.queue.add(record);
      void syncQueue.flush();
      setSaved(record);
      setDirty(false);
      refreshSessions();
      return record;
    } catch (saveErr) {
      // Server unreachable or rejected: keep the draft and fall back to the
      // local queue so nothing the user wrote is lost.
      queueSession(record);
      syncQueue.queue.add(record);
      setSaved(record);
      setDirty(false);
      refreshSessions();
      setSaveError(
        saveErr instanceof Error
          ? `${saveErr.message} Saved locally — it will sync when you are back online.`
          : "Saved locally — it will sync when you are back online.",
      );
      return record;
    }
  }

  // --- Navigation guard wiring -------------------------------------------
  const requestNavigation = useCallback(
    (go: () => void) => {
      if (!isDirty) {
        go();
        return;
      }
      setPendingNav(() => go);
    },
    [isDirty],
  );

  const confirmLeave = useCallback(() => {
    discardDraft();
    setPendingNav(null);
    const go = pendingNav;
    requestAnimationFrame(() => go?.());
  }, [discardDraft, pendingNav]);

  const emotionEntries = interpretation
    ? (Object.entries(interpretation.emotion_scores) as [EmotionValue, number][])
    : [];

  const topEmotion = interpretation?.dominant_emotion;

  return (
    <DraftGuardProvider value={requestNavigation}>
      <NavigationGuard enabled={isDirty} />

      <div className="container" style={{ paddingTop: "6rem" }}>
        <header className="section-heading" style={{ marginBottom: "2rem" }}>
          <p className="eyebrow">
            <Sparkles size={12} aria-hidden="true" /> Write
          </p>
          <h1>Interpret a dream</h1>
          <p className="section-copy">
            Write down your dream in as much detail as you remember, then run
            the interpretation. Nothing leaves this device unless you save it.
          </p>
        </header>

        <div className="dashboard-grid">
          <div className="stack-lg">
            <form className="glass" onSubmit={handleInterpret} noValidate>
              <div
                className="row"
                style={{ justifyContent: "space-between", marginBottom: "0.75rem" }}
              >
                <label className="form-label" htmlFor="dream-text" style={{ margin: 0 }}>
                  Dream description
                </label>
                <span
                  className={`char-counter${showErrors && textError ? " char-counter-invalid" : ""}`}
                  aria-live="polite"
                >
                  {text.length} characters
                </span>
              </div>

              <textarea
                id="dream-text"
                className="form-textarea"
                placeholder="Last night I was back in my childhood home, but every door opened into a different season..."
                value={text}
                onChange={(event) => {
                  setText(event.target.value);
                  setDirty(true);
                  setSaved(null);
                }}
                aria-invalid={showErrors && Boolean(textError)}
                aria-describedby={showErrors && textError ? "dream-text-error" : undefined}
                rows={10}
                disabled={loading}
                style={{ minHeight: "240px" }}
              />

              {showErrors && textError && (
                <p className="form-error" id="dream-text-error">
                  {textError}
                </p>
              )}

              <div
                className="row"
                style={{ justifyContent: "space-between", marginTop: "1rem", flexWrap: "wrap", gap: "0.75rem" }}
              >
                <p className="text-muted" style={{ fontSize: "0.8rem" }}>
                  <Compass size={12} aria-hidden="true" style={{ verticalAlign: "-2px" }} />{" "}
                  Emotion scores are produced by a local rule-based model over
                  your text — no account required.
                </p>

                <button className="btn btn-primary" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 size={15} className="spin" aria-hidden="true" /> Interpreting...
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} aria-hidden="true" /> Interpret dream
                    </>
                  )}
                </button>
              </div>

              {restored && !dirty && (
                <p className="text-muted" style={{ fontSize: "0.8rem", marginTop: "0.75rem" }}>
                  <CheckCircle2 size={12} aria-hidden="true" style={{ verticalAlign: "-2px" }} />{" "}
                  A restored draft was loaded. Edit the text or press
                  &ldquo;Interpret dream&rdquo; to continue.
                </p>
              )}
            </form>

            <div ref={errorRef} tabIndex={-1} style={{ outline: "none" }}>
              {error && (
                <div className="form-error glass" role="alert" style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                  <AlertTriangle size={16} aria-hidden="true" style={{ marginTop: "2px", flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <div ref={resultRef} tabIndex={-1} style={{ outline: "none" }}>
              {interpretation && (
                <section aria-labelledby="result-title" className="glass stack-md">
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <div>
                      <p className="eyebrow" style={{ marginBottom: "0.35rem" }}>
                        Interpretation
                      </p>
                      <h2 id="result-title" style={{ fontSize: "1.35rem" }}>
                        {interpretation.title}
                      </h2>
                    </div>

                    {topEmotion && (
                      <span className="badge">
                        <span aria-hidden="true">{emotionEmoji(topEmotion)}</span>{" "}
                        {topEmotion}
                      </span>
                    )}
                  </div>

                  <p style={{ lineHeight: 1.75 }}>{interpretation.summary}</p>

                  <div>
                    <p className="eyebrow" style={{ marginBottom: "0.75rem" }}>
                      Emotion profile
                    </p>
                    <ul className="stack-md" style={{ listStyle: "none" }}>
                      {emotionEntries.map(([emotion, value]) => (
                        <li key={emotion}>
                          <div
                            className="row"
                            style={{ justifyContent: "space-between", marginBottom: "0.3rem" }}
                          >
                            <span
                              className="row"
                              style={{ gap: "0.4rem", fontSize: "0.88rem" }}
                            >
                              <span aria-hidden="true">{emotionEmoji(emotion)}</span>
                              <span style={{ textTransform: "capitalize" }}>
                                {emotion}
                              </span>
                            </span>
                            <span className="text-muted" style={{ fontSize: "0.8rem" }}>
                              {(value * 100).toFixed(1)}%
                            </span>
                          </div>

                          <div
                            className="progress-track"
                            role="progressbar"
                            aria-valuenow={Math.round(value * 100)}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${emotion} score`}
                          >
                            <div
                              className="progress-fill"
                              style={{
                                width: `${Math.max(3, Math.min(100, value * 100))}%`,
                                background:
                                  emotion === topEmotion
                                    ? "var(--accent)"
                                    : "var(--accent-soft)",
                              }}
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="row" style={{ flexWrap: "wrap", gap: "0.75rem", marginTop: "0.25rem" }}>
                    <SaveButton onSave={handleSave} hasResult={Boolean(interpretation)} />

                    {saved && (
                      <button
                        className="btn btn-ghost"
                        onClick={() => router.push(`/session/${saved.id}`)}
                      >
                        View saved record
                      </button>
                    )}
                  </div>

                  {saveError && (
                    <p className="text-muted" role="status" style={{ fontSize: "0.82rem" }}>
                      {saveError}
                    </p>
                  )}
                </section>
              )}
            </div>
          </div>

          <div>
            <TimelineRail sessions={sessions} />
          </div>
        </div>
      </div>

      <UnsavedChangesDialog
        open={pendingNav !== null}
        onCancel={() => setPendingNav(null)}
        onConfirm={confirmLeave}
      />
    </DraftGuardProvider>
  );
}
