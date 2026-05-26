import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Sticky-friendly action row — use one primary button per bar when possible. */
export function ActionBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
        "rounded-2xl border border-border/80 bg-card/80 p-3 shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}
