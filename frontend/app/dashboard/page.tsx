import type { Metadata } from "next";

import DashboardClient from "@/components/detector/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Live webcam, image and video facial-emotion analysis powered by a FER+ ONNX model served through FastAPI.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
