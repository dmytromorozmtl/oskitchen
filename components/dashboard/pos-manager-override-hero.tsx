"use client";

import { ShieldAlert } from "lucide-react";

import {
  buildPosManagerOverrideSummary,
  type PosManagerOverrideChecklistInput,
} from "@/lib/pos/pos-manager-override-clarity-era19";

export function PosManagerOverrideHero(props: PosManagerOverrideChecklistInput) {
  const summary = buildPosManagerOverrideSummary(props);

  return (
    <div
      className="rounded-xl border border-amber-200/80 bg-amber-50/50 px-3 py-3 dark:border-amber-900/50 dark:bg-amber-950/20"
      data-testid="pos-manager-override-hero"
    >
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden />
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-foreground">{summary.headline}</p>
          <p className="text-xs text-muted-foreground">{summary.detail}</p>
          <p className="text-[11px] text-muted-foreground/90">
            Manager override is audit-logged — no PIN flow or Toast hardware parity claim.
          </p>
        </div>
      </div>
    </div>
  );
}
