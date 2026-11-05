import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, CloudOff, Plus } from "lucide-react";

import { emotionEmoji } from "@/lib/emotions";
import type { DreamSession } from "@/lib/types";
import DeleteAllButton from "@/components/session/DeleteAllButton";

export const metadata: Metadata = {
  title: "Timeline",
  description: "Every dream session you have saved, newest first.",
};

async function fetchSessions(): Promise<{ sessions: DreamSession[]; source: "api" | "none" }> {
  const baseUrl = process.env.API_BASE_URL;

  if (!baseUrl) return { sessions: [], source: "none" };

  try {
    const response = await fetch(`${baseUrl}/api/sessions`, { cache: "no-store" });

    if (!response.ok) throw new Error(`status ${response.status}`);

    const sessions = (await response.json()) as DreamSession[];
    return { sessions, source: "api" };
  } catch {
    return { sessions: [], source: "none" };
  }
}

export default async function SessionListPage() {
  const { sessions, source } = await fetchSessions();

  return (
    <main
      id="main"
      className="container"
      style={{ paddingTop: "7rem", paddingBottom: "5rem" }}
    >
      <header
        className="section-heading"
        style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", gap: "1.5rem", flexWrap: "wrap", alignItems: "flex-end" }}
      >
        <div>
          <p className="eyebrow">
            <CalendarDays size={12} aria-hidden="true" /> Timeline
          </p>
          <h1>Saved sessions</h1>
          <p className="section-copy">
            Every dream record that reached the server. Records saved while
            offline live in this browser and appear on the write page&apos;s
            rail.
          </p>
        </div>

        <Link href="/session/write" className="btn btn-primary">
          <Plus size={15} aria-hidden="true" /> New session
        </Link>
      </header>

      {source === "none" && (
        <div className="glass row" style={{ gap: "0.6rem", marginBottom: "1.5rem", padding: "1rem 1.25rem" }}>
          <CloudOff size={15} aria-hidden="true" style={{ color: "var(--accent)", flexShrink: 0 }} />
          <p className="text-muted" style={{ fontSize: "0.86rem" }}>
            The backend API could not be reached, so server records cannot be
            listed right now. Locally saved records are still available from
            the write page.
          </p>
        </div>
      )}

      {sessions.length === 0 && source === "api" ? (
        <div className="glass" style={{ padding: "3rem 2rem", textAlign: "center" }}>
          <p className="eyebrow" style={{ marginBottom: "0.6rem" }}>
            Nothing saved yet
          </p>
          <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
            Interpret a dream and press &ldquo;Save session&rdquo; to start your
            timeline.
          </p>
          <Link href="/session/write" className="btn btn-primary">
            <Plus size={15} aria-hidden="true" /> Write your first dream
          </Link>
        </div>
      ) : (
        <ul className="grid grid-3" style={{ marginBottom: "2.5rem" }}>
          {sessions.map((session) => (
            <li key={session.id}>
              <Link
                href={`/session/${session.id}`}
                className="glass glass-hover"
                style={{ display: "block", height: "100%", textDecoration: "none", color: "inherit" }}
              >
                <div
                  className="row"
                  style={{ justifyContent: "space-between", marginBottom: "0.6rem" }}
                >
                  <span aria-hidden="true" style={{ fontSize: "1.5rem" }}>
                    {emotionEmoji(session.dominant_emotion)}
                  </span>
                  <time className="text-muted" style={{ fontSize: "0.78rem" }}>
                    {new Date(session.created_at).toLocaleDateString()}
                  </time>
                </div>

                <p
                  className="text-accent"
                  style={{ textTransform: "capitalize", fontWeight: 600, marginBottom: "0.35rem" }}
                >
                  {session.dominant_emotion}
                </p>

                <p
                  className="text-muted"
                  style={{
                    fontSize: "0.86rem",
                    display: "-webkit-box",
                    WebkitLineClamp: 4,
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
      )}

      {sessions.length > 0 && (
        <div style={{ maxWidth: "26rem" }}>
          <DeleteAllButton />
        </div>
      )}
    </main>
  );
}
