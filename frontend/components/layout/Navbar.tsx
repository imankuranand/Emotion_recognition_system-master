"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ApiStatus } from "./ApiStatus";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/analytics", label: "Analytics" },
  { href: "/about", label: "About" },
  { href: "/docs", label: "Documentation" },
];

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="h-8 w-8 shrink-0"
        fill="none"
      >
        <defs>
          <linearGradient id="logo-hex" x1="4" y1="3" x2="28" y2="29">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <path
          d="M16 3 L27.5 9.5 V22.5 L16 29 L4.5 22.5 V9.5 Z"
          stroke="url(#logo-hex)"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="16" r="4.6" stroke="#22d3ee" strokeWidth="1.4" />
        <circle cx="16" cy="16" r="1.7" fill="#22d3ee" />
        <path
          d="M16 6.6 V9 M16 23 V25.4 M7.8 11.3 L10 12.6 M24.2 11.3 L22 12.6"
          stroke="#3b82f6"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[15px] font-semibold tracking-[0.24em] text-frost">
          AFFECTRA
        </span>
        <span className="mt-0.5 font-mono text-[9px] tracking-[0.18em] text-muted/80">
          EMOTION INTELLIGENCE
        </span>
      </span>
    </span>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink/72 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" aria-label="AFFECTRA home" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3.5 py-2 font-display text-[13px] tracking-wide transition-colors duration-150 ${
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:bg-white/[0.04] hover:text-frost"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <ApiStatus compact />
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:text-frost lg:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav
          className="border-t border-line bg-abyss/95 px-5 py-3 lg:hidden"
          aria-label="Mobile"
        >
          <div className="flex flex-col gap-1">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-3 py-2.5 font-display text-sm tracking-wide transition-colors ${
                    active ? "bg-accent/10 text-accent" : "text-muted hover:text-frost"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
