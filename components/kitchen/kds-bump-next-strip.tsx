"use client";

import {
  isKdsBumpNextUrgent,
  kdsBumpNextDetail,
  kdsBumpNextLabel,
  type KdsBumpNextTicket,
} from "@/lib/kitchen/kds-bump-next-era18";
import { cn } from "@/lib/utils";

export function KdsBumpNextStrip(props: {
  ticket: KdsBumpNextTicket;
  pending: boolean;
  onBump: (orderId: string) => void;
}) {
  const urgent = isKdsBumpNextUrgent(props.ticket);

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 shadow-sm",
        urgent
          ? "border-rose-300/80 bg-rose-50/60 dark:border-rose-900/50 dark:bg-rose-950/30"
          : "border-primary/25 bg-primary/[0.04]",
      )}
      data-testid="kds-bump-next-strip"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {urgent ? "Bump next — overdue" : "Bump next"}
          </p>
          <p className="mt-1 text-lg font-bold">{kdsBumpNextLabel(props.ticket)}</p>
          <p className="text-sm text-muted-foreground">{kdsBumpNextDetail(props.ticket)}</p>
        </div>
        <button
          type="button"
          disabled={props.pending}
          onClick={() => props.onBump(props.ticket.id)}
          aria-label={`Bump order ${kdsBumpNextLabel(props.ticket)} ready`}
          data-testid="kds-bump-next-button"
          className={cn(
            "min-h-14 w-full shrink-0 rounded-2xl px-6 py-4 text-lg font-bold text-white transition-all active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 sm:w-auto sm:min-w-[12rem]",
            urgent
              ? "bg-rose-600 hover:bg-rose-700 focus-visible:outline-rose-500"
              : "bg-emerald-600 hover:bg-emerald-700 focus-visible:outline-emerald-500",
          )}
        >
          BUMP — Ready!
        </button>
      </div>
    </div>
  );
}
