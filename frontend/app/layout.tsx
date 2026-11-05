import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { SessionProvider } from "@/lib/session";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AFFECTRA — AI Facial Emotion Recognition",
    template: "%s · AFFECTRA",
  },
  description:
    "Real-time facial emotion recognition: webcam, image and video analysis powered by a FER+ convolutional neural network served through a FastAPI/ONNX backend.",
  keywords: [
    "facial emotion recognition",
    "FER+",
    "computer vision",
    "deep learning",
    "ONNX Runtime",
    "FastAPI",
    "B.Tech capstone",
  ],
  authors: [{ name: "AFFECTRA Project" }],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
