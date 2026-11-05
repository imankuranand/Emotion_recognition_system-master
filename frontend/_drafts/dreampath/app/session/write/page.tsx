import type { Metadata } from "next";
import { Suspense } from "react";

import WriteClient from "@/components/session/WriteClient";

export const metadata: Metadata = {
  title: "Write",
  description:
    "Describe a dream and get an emotion-weighted interpretation you can save to your journal.",
};

export default function WritePage() {
  return (
    <Suspense fallback={<div className="container" style={{ paddingTop: "8rem" }} aria-busy="true" />}>
      <WriteClient />
    </Suspense>
  );
}
