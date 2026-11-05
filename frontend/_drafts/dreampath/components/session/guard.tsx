"use client";

import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import { useContext, createContext, type ReactNode } from "react";

type GuardFn = (go: () => void) => void;

/**
 * Provided by WriteClient while a draft is being edited. When absent (e.g. on
 * pages without a draft) links behave like normal Next.js links.
 */
const DraftGuardContext = createContext<GuardFn | null>(null);

export const DraftGuardProvider = DraftGuardContext.Provider;

export function useDraftGuard(): GuardFn | null {
  return useContext(DraftGuardContext);
}

interface GuardedLinkProps extends Omit<LinkProps, "href"> {
  href: string;
  children: ReactNode;
}

/**
 * A link that asks the draft guard for permission before navigating.
 * Without a guard (or when the draft is clean) it navigates immediately.
 */
export default function GuardedLink({ href, children, onClick, ...rest }: GuardedLinkProps) {
  const guard = useDraftGuard();
  const router = useRouter();

  return (
    <Link
      href={href}
      {...rest}
      onClick={(event) => {
        onClick?.(event);

        if (
          event.defaultPrevented ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0 ||
          !guard
        ) {
          return;
        }

        event.preventDefault();
        guard(() => router.push(href));
      }}
    >
      {children}
    </Link>
  );
}
