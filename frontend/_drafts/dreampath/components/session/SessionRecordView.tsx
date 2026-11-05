import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CloudOff,
  FileText,
  Quote,
} from "lucide-react";

import { emotionEmoji, INTERPRETATION_TIPS } from "@/lib/emotions";
import type { DreamSession } from "@/lib/types";
import SessionSyncNotice from "@/components/session/SessionSyncNotice";
import DeleteSessionButton from "@/components/session/DeleteSessionButton";

/**
 * Full record view. Kept free of hooks so it can be rendered from both the
 * server page (API lookup) and the client fallback (local-storage lookup).
 */
export default function SessionRecordView({ record }: { record: DreamSession }) {
  const dominant = record.dominant_emotion;
  const emotionEntries = Object.entries(record.interpretation.emotion_scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  const topScore = emotionEntries[0]?.[1] ?? 1;
  const backendConfigured = Boolean(process.env.API_BASE_URL);

  return (
    <main
      id="main"
      className="container"
      style={{ paddingTop: "7rem", paddingBottom: "5rem" }}
    >
      <Link
        href="/session"
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: "1.5rem" }}
      >
        <ArrowLeft size={14} aria-hidden="true" /> Back to timeline
      </Link>

      <header style={{ marginBottom: "2rem" }}>
        <p className="eyebrow">
          <CalendarDays size={12} aria-hidden="true" />{" "}
          {new Date(record.created_at).toLocaleString()}
        </p>

        <div
          className="row"
          style={{ gap: "0.9rem", alignItems: "flex-start", flexWrap: "wrap" }}
        >
          <h1 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)" }}>
            {record.interpretation.title}
          </h1>

          <span className="badge" aria-label={`Dominant emotion: ${dominant}`}>
            <span aria-hidden="true">{emotionEmoji(dominant)}</span> {dominant}
          </span>
        </div>

        {!backendConfigured && (
          <p
            className="text-muted row"
            style={{ gap: "0.4rem", fontSize: "0.82rem", marginTop: "0.6rem" }}
          >
            <CloudOff size={13} aria-hidden="true" /> Stored in this browser
            only (no backend configured).
          </p>
        )}
      </header>

      <div className="dashboard-grid">
        <div className="stack-lg">
          <section aria-labelledby="record-dream" className="glass stack-sm">
            <p className="eyebrow" id="record-dream">
              <FileText size={12} aria-hidden="true" /> Dream record
            </p>
            <p
              className="text-muted"
              style={{ lineHeight: 1.75, whiteSpace: "pre-wrap" }}
            >
              {record.dream_text}
            </p>
          </section>

          <section aria-labelledby="record-summary" className="glass stack-sm">
            <p className="eyebrow" id="record-summary">
              <Quote size={12} aria-hidden="true" /> Interpretation
            </p>
            <p style={{ lineHeight: 1.75 }}>{record.interpretation.summary}</p>
          </section>

          <section aria-labelledby="record-tips" className="glass stack-sm">
            <p className="eyebrow" id="record-tips">
              Reflect further
            </p>
            <ul className="stack-sm" style={{ paddingLeft: "1.1rem" }}>
              {INTERPRETATION_TIPS.slice(0, 3).map((tip) => (
                <li
                  key={tip}
                  className="text-muted"
                  style={{ fontSize: "0.9rem", lineHeight: 1.6 }}
                >
                  {tip}
                </li>
              ))}
            </ul>
          </section>

          <div className="row" style={{ gap: "0.75rem", flexWrap: "wrap" }}>
            <Link href="/session/write" className="btn btn-primary">
              Write a new dream
            </Link>
            <DeleteSessionButton id={record.id} />
          </div>
        </div>

        <aside aria-label="Emotion breakdown" className="stack-md">
          <div className="glass" style={{ padding: "1.5rem" }}>
            <p className="eyebrow" style={{ marginBottom: "1rem" }}>
              Emotion breakdown
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
                        width: `${Math.max(3, (value / topScore) * 100)}%`,
                        background:
                          emotion === dominant
                            ? "var(--accent)"
                            : "var(--accent-soft)",
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>

            <SessionSyncNotice record={record} />
          </div>
        </aside>
      </div>
    </main>
  );
}
