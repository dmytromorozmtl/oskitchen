"use client";

import Link from "next/link";

/**
 * Compact setup hint — parent supplies cheap aggregates from the server layout (no Prisma here).
 */
export function SetupProgressNavWidget({
  percent,
  nextLabel,
  nextHref,
  why,
}: {
  percent: number;
  nextLabel: string;
  nextHref: string;
  why?: string;
}) {
  const p = Math.max(0, Math.min(100, percent));
  return (
    <div className="mx-2 mb-2 rounded-xl border border-border/70 bg-muted/30 px-3 py-2">
      <p className="text-[11px] font-medium text-muted-foreground">Workspace setup</p>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary transition-all" style={{ width: `${p}%` }} />
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        <span className="font-semibold text-foreground">{Math.round(p)}%</span> —{" "}
        <Link href={nextHref} className="underline-offset-2 hover:underline">
          {nextLabel}
        </Link>
      </p>
      {why ? <p className="mt-1 text-[10px] leading-snug text-muted-foreground">{why}</p> : null}
    </div>
  );
}
