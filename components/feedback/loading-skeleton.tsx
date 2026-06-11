import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";
import { PageShell } from "@/components/layout/page-shell";
import { SKELETON_PULSE_CLASS } from "@/lib/design/loading-skeleton-patterns";

export function LoadingSkeleton({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn("animate-pulse rounded-xl", SKELETON_PULSE_CLASS, className)}
      style={style}
      aria-hidden
    />
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading" data-testid="page-skeleton">
      <LoadingSkeleton className="h-10 w-64" />
      <LoadingSkeleton className="h-32 w-full" />
      <LoadingSkeleton className="h-64 w-full" />
    </div>
  );
}

/** PageShell + PageSkeleton — preferred dashboard route loading (DES-28). */
export function DashboardPageSkeleton() {
  return (
    <PageShell>
      <PageSkeleton />
    </PageShell>
  );
}
