import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

/**
 * Lightweight page chrome — use registry-backed titles on individual pages when needed.
 */
export function PageContextHeader({
  title,
  description,
  primaryAction,
  secondaryActions,
  badge,
}: {
  title: string;
  description?: string;
  primaryAction?: ReactNode;
  secondaryActions?: ReactNode;
  badge?: string;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {badge ? (
            <Badge variant="secondary" className="rounded-full text-[10px] font-normal uppercase">
              {badge}
            </Badge>
          ) : null}
        </div>
        {description ? <p className="max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {secondaryActions}
        {primaryAction}
      </div>
    </div>
  );
}
