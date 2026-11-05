import Link from "next/link";

import type { DreamSession } from "@/lib/types";
import { emotionEmoji } from "@/lib/emotions";

interface RecentSessionsProps {
  sessions: DreamSession[];
}

export default function RecentSessions({ sessions }: RecentSessionsProps) {
  if (sessions.length === 0) {
    return (
      <section aria-labelledby="recent-title" className="stack-lg">
        <div className="section-heading">
          <p className="eyebrow">Your journal</p>
          <h2 id="recent-title">No sessions yet</h2>
          <p className="section-copy">
            Save your first dream and it will show up here with its emotion
            profile and interpretation.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="recent-title" className="stack-lg">
      <div className="section-heading">
        <p className="eyebrow">Your journal</p>
        <h2 id="recent-title">Recent sessions</h2>
        <p className="section-copy">
          The last few dreams you interpreted, newest first.
        </p>
      </div>

      <ul className="grid grid-3">
        {sessions.slice(0, 6).map((session) => (
          <li key={session.id}>
            <Link
              href={`/session/${session.id}`}
              className="glass glass-hover"
              style={{
                display: "block",
                height: "100%",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div
                className="row"
                style={{ justifyContent: "space-between", marginBottom: "0.5rem" }}
              >
                <span aria-hidden="true" style={{ fontSize: "1.4rem" }}>
                  {emotionEmoji(session.dominant_emotion)}
                </span>
                <time className="text-muted" style={{ fontSize: "0.78rem" }}>
                  {new Date(session.created_at).toLocaleDateString()}
                </time>
              </div>

              <p
                className="text-accent"
                style={{ textTransform: "capitalize", fontWeight: 600 }}
              >
                {session.dominant_emotion}
              </p>

              <p
                className="text-muted"
                style={{
                  fontSize: "0.86rem",
                  marginTop: "0.35rem",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {session.dream_text}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
