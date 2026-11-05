import { CalendarDays } from "lucide-react";

import type { DreamSession } from "@/lib/types";
import { emotionEmoji } from "@/lib/emotions";
import DeleteSessionButton from "@/components/session/DeleteSessionButton";
import GuardedLink from "@/components/session/guard";

interface TimelineRailProps {
  sessions: DreamSession[];
}

export default function TimelineRail({ sessions }: TimelineRailProps) {
  return (
    <aside aria-label="Saved sessions" className="stack-md">
      <div className="glass" style={{ padding: "1.25rem" }}>
        <div
          className="row"
          style={{ justifyContent: "space-between", marginBottom: "1rem" }}
        >
          <p className="eyebrow" style={{ margin: 0 }}>
            <CalendarDays size={12} aria-hidden="true" /> Timeline
          </p>
          <span className="text-muted" style={{ fontSize: "0.78rem" }}>
            {sessions.length} saved
          </span>
        </div>

        {sessions.length === 0 ? (
          <p className="text-muted" style={{ fontSize: "0.86rem" }}>
            No saved sessions yet. Records you keep will appear here,
            newest first.
          </p>
        ) : (
          <ol className="timeline">
            {sessions.map((session) => (
              <li key={session.id} className="timeline-item">
                <span aria-hidden="true">{emotionEmoji(session.dominant_emotion)}</span>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <p
                    style={{
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      textTransform: "capitalize",
                    }}
                  >
                    {session.dominant_emotion}
                  </p>

                  <p
                    className="text-muted"
                    style={{
                      fontSize: "0.8rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {session.dream_text}
                  </p>

                  <time className="text-muted" style={{ fontSize: "0.74rem" }}>
                    {new Date(session.created_at).toLocaleString()}
                  </time>
                </div>

                <div className="row" style={{ gap: "0.25rem" }}>
                  <GuardedLink
                    href={`/session/${session.id}`}
                    className="btn btn-ghost btn-sm"
                    aria-label={`View session from ${new Date(session.created_at).toLocaleDateString()}`}
                    title="View session"
                    style={{ padding: "0.35rem" }}
                  >
                    View
                  </GuardedLink>

                  <DeleteSessionButton id={session.id} compact />
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      <p className="text-muted" style={{ fontSize: "0.78rem" }}>
        Records are stored in your browser&apos;s local storage when offline,
        and synced to the server once connected.
      </p>
    </aside>
  );
}
