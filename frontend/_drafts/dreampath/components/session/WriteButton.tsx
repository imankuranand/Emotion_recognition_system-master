"use client";

import { useRouter } from "next/navigation";

export default function WriteButton() {
  const router = useRouter();

  return (
    <button
      className="btn btn-primary"
      onClick={() => router.push("/session/write")}
    >
      Start writing
    </button>
  );
}
