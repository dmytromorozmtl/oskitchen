"use client";

import { useEffect, useState } from "react";

type Props = {
  /** Shown when realtime transport is not yet subscribed. */
  hint?: string;
};

/**
 * Lightweight operational feed shell — pairs with manual refresh / polling until
 * a shared realtime channel is enabled for the workspace.
 */
export function LiveActivityFeed({
  hint = "Operational events appear here when realtime or server push is connected. Until then, use refresh and deep links from Today.",
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="space-y-2 text-sm text-muted-foreground">
      <p>{hint}</p>
      <p className="text-xs font-mono text-muted-foreground/80">
        Client clock · {mounted ? new Date().toLocaleTimeString() : "—"}
      </p>
    </div>
  );
}
