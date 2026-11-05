"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const DEMO_DREAM =
  "I was walking through an endless library where every book contained a " +
  "memory I had forgotten. The shelves kept growing taller whenever I tried " +
  "to leave, and a soft wind turned the pages on its own. I felt both " +
  "curious and slightly trapped, as if the building itself wanted me to " +
  "keep reading.";

/**
 * Opens the write page with a sample dream already filled in.
 * The user still has to press "Interpret dream", so nothing runs
 * without their action.
 */
export default function DemoButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleDemo() {
    setLoading(true);
    router.push(`/session/write?dream=${encodeURIComponent(DEMO_DREAM)}`);
  }

  return (
    <button className="btn btn-ghost" onClick={handleDemo} disabled={loading}>
      {loading ? "Opening..." : "Load sample dream"}
    </button>
  );
}
