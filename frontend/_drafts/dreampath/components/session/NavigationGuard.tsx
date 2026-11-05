"use client";

import { useBeforeUnload } from "react";

/**
 * Warns before the tab is closed or reloaded while a draft is dirty.
 *
 * In-app navigation is intentionally left alone: a soft navigation within the
 * app does not destroy the draft (the component tree for the form stays
 * mounted until the route actually changes), and Next's App Router does not
 * provide a reliable cancelable navigation event.
 */
export default function NavigationGuard({ enabled }: { enabled: boolean }) {
  useBeforeUnload(
    (event) => {
      if (!enabled) return;
      event.preventDefault();
      event.returnValue = "";
    },
    enabled,
  );

  return null;
}
