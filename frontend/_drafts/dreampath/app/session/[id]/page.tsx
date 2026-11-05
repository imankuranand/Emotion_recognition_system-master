import type { Metadata } from "next";

import type { DreamSession } from "@/lib/types";
import { getSession } from "@/lib/local-data";
import SessionRecordView from "@/components/session/SessionRecordView";
import LocalSessionFallback from "@/components/session/LocalSessionFallback";

export const metadata: Metadata = {
  title: "Session record",
};

interface SessionDetailPageProps {
  params: Promise<{ id: string }>;
}

async function fetchSession(id: string): Promise<DreamSession | null> {
  const baseUrl = process.env.API_BASE_URL;

  if (!baseUrl) return null;

  try {
    const response = await fetch(`${baseUrl}/api/sessions/${id}`, {
      cache: "no-store",
    });

    if (response.ok) {
      return (await response.json()) as DreamSession;
    }

    // 404 from the API: it might still exist in local storage (offline save),
    // so fall through to the client-side lookup rather than hard 404.
    return null;
  } catch {
    // Backend unreachable — same fallback.
    return null;
  }
}

export default async function SessionDetailPage({ params }: SessionDetailPageProps) {
  const { id } = await params;
  const session = await fetchSession(id);

  if (session) {
    return <SessionRecordView record={session} />;
  }

  // Server rendering cannot read local storage; the client fallback checks it.
  if (typeof window === "undefined") {
    const local = getSession(id);
    if (local) return <SessionRecordView record={local} />;
  }

  return <LocalSessionFallback id={id} />;
}
