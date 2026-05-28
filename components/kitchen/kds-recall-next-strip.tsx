"use client";

import {
  kdsBumpNextDetail,
  kdsBumpNextLabel,
  pickKdsRecallNextTicket,
  type KdsBumpNextTicket,
} from "@/lib/kitchen/kds-bump-next-era18";
import { isKdsTicketOverdue } from "@/lib/kitchen/kds-queue-clarity-era18";
import { cn } from "@/lib/utils";

export function KdsRecallNextStrip(props: {
  ready: readonly KdsBumpNextTicket[];
  pending: boolean;
  onRecall: (orderId: string) => void;
}) {
  const ticket = pickKdsRecallNextTicket(props.ready);
  if (!ticket) return null;

  const urgent = isKdsTicketOverdue(ticket.elapsedSeconds);

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 shadow-sm",
        urgent
          ? "border-amber-300/80 bg-amber-50/60 dark:border-amber-900/50 dark:bg-amber-950/30"
          : "border-amber-200/60 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20",
      )}
      data-testid="kds-recall-next-strip"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {urgent ? "Recall next — waiting too long" : "Recall next"}
          </p>
          <p className="mt-1 text-lg font-bold">{kdsBumpNextLabel(ticket)}</p>
          <p className="text-sm text-muted-foreground">{kdsBumpNextDetail(ticket)}</p>
        </div>
        <button
          type="button"
          disabled={props.pending}
          onClick={() => props.onRecall(ticket.id)}
          aria-label={`Recall order ${kdsBumpNextLabel(ticket)} to prep`}
          data-testid="kds-recall-next-button"
          className={cn(
            "min-h-14 w-full shrink-0 rounded-2xl px-6 py-4 text-lg font-bold text-white transition-all active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 sm:w-auto sm:min-w-[12rem]",
            urgent
              ? "bg-amber-700 hover:bg-amber-800 focus-visible:outline-amber-500"
              : "bg-amber-600 hover:bg-amber-700 focus-visible:outline-amber-500",
          )}
        >
          Recall to prep
        </button>
      </div>
    </div>
  );
}
