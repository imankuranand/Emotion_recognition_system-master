import Link from "next/link";
import { EmotionGrid } from "@/components/landing/EmotionGrid";
import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { Pipeline } from "@/components/landing/Pipeline";
import { TechStack } from "@/components/landing/TechStack";
import { btnPrimary } from "@/lib/ui";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Pipeline />
      <EmotionGrid />
      <Features />
      <TechStack />

      {/* Closing CTA */}
      <section className="mx-auto w-full max-w-6xl px-5 pb-24 sm:px-8">
        <div className="glass-strong panel-glow flex flex-col items-center gap-6 rounded-2xl px-6 py-12 text-center">
          <p className="label-chip">Ready when you are</p>
          <h2 className="max-w-2xl font-display text-2xl font-semibold leading-snug tracking-tight text-frost">
            Point a camera at a face and watch eight probabilities update in
            real time.
          </h2>
          <Link href="/dashboard" className={btnPrimary}>
            Launch the dashboard
          </Link>
        </div>
      </section>
    </>
  );
}
