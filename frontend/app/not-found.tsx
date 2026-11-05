import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main
      id="main"
      className="container"
      style={{
        paddingTop: "8rem",
        minHeight: "70vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
      }}
    >
      <div className="glass" style={{ maxWidth: "32rem", width: "100%", textAlign: "center", padding: "2.5rem 2rem" }}>
        <Compass
          size={28}
          aria-hidden="true"
          style={{ color: "var(--accent)", margin: "0 auto 1rem" }}
        />
        <p className="eyebrow">404</p>
        <h1 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
          This path doesn&apos;t exist
        </h1>
        <p className="text-muted" style={{ marginBottom: "1.75rem" }}>
          The page you were looking for isn&apos;t here. Head back to the home
          page or open the dashboard.
        </p>
        <div className="row" style={{ justifyContent: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/" className="btn btn-primary">
            Back to home
          </Link>
          <Link href="/dashboard" className="btn btn-ghost">
            Open dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
