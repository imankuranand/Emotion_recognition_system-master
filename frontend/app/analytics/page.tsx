import type { Metadata } from "next";

import AnalyticsClient from "@/components/analytics/AnalyticsClient";

export const metadata: Metadata = {
  title: "Analytics",
  description:
    "Session-level emotion analytics: distribution, confidence, timelines and per-source breakdowns — all derived from real model responses.",
};

export default function AnalyticsPage() {
  return <AnalyticsClient />;
}
