"use client";

import * as React from "react";
import { Radio } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Lightweight sync affordance — realtime channels can replace polling later.
 * Shows last refresh intent; parent pages remain server-rendered.
 */
export function SyncIndicator({ className }: { className?: string }) {
  const [pulse, setPulse] = React.useState(false);
  React.useEffect(() => {
    const id = window.setInterval(() => setPulse((p) => !p), 4000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground",
        pulse ? "opacity-90" : "opacity-60",
        className,
      )}
      title="Data refreshes when you open or revisit a page. Supabase Realtime can augment hot modules later."
    >
      <Radio className="h-3 w-3" />
      Sync on load
    </span>
  );
}
