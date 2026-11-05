import Link from "next/link";
import { Logo } from "./Navbar";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/analytics", label: "Analytics" },
  { href: "/about", label: "About the Project" },
  { href: "/docs", label: "Documentation" },
];

const STACK = [
  "Next.js 16",
  "TypeScript",
  "Tailwind CSS",
  "FastAPI",
  "ONNX Runtime",
  "OpenCV",
];

/**
 * The copyright year is time-dependent, which prerendering forbids as an
 * unstable value — caching it makes the render deterministic while still
 * refreshing on rebuilds.
 */
async function getCopyrightYear(): Promise<number> {
  "use cache";
  return new Date().getFullYear();
}

export async function Footer() {
  const year = await getCopyrightYear();

  return (
    <footer className="border-t border-line bg-abyss/60">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            A production-grade facial emotion recognition platform built on the
            FER+ convolutional neural network. Designed as a third-year B.Tech
            capstone project with genuine ML inference – no simulated results.
          </p>
        </div>

        <nav aria-label="Footer" className="space-y-2.5">
          <p className="label-chip">Navigate</p>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block text-sm text-muted transition-colors hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-2.5">
          <p className="label-chip">Engine</p>
          <ul className="space-y-1.5">
            {STACK.map((item) => (
              <li key={item} className="font-mono text-xs tracking-wider text-muted">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-5 text-xs text-muted/80 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>© {year} AFFECTRA · Facial Emotion Recognition System</span>
          <span className="font-mono tracking-wider">
            FER+ model · Apache-2.0 &amp; MIT licensed components
          </span>
        </div>
      </div>
    </footer>
  );
}
