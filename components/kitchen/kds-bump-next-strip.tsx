"use client";

import {
  isKdsBumpNextUrgent,
  kdsBumpNextDetail,
  kdsBumpNextLabel,
  type KdsBumpNextTicket,
} from "@/lib/kitchen/kds-bump-next-era18";
import { triggerKdsHaptic } from "@/lib/kitchen/kds-haptics";
import { KDS_BUMP_TICKET_BUTTON_CLASS } from "@/lib/design/kds-bump-ticket-ux-policy";
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
          onClick={() => {
            triggerKdsHaptic("bump");
            props.onBump(props.ticket.id);
          }}
          aria-label={`Bump order ${kdsBumpNextLabel(props.ticket)} ready`}
          data-testid="kds-bump-next-button"
          className={cn(
            KDS_BUMP_TICKET_BUTTON_CLASS,
            "shrink-0 text-white disabled:opacity-60 sm:w-auto sm:min-w-[12rem]",
            urgent
              ? "rounded-2xl bg-rose-600 hover:bg-rose-700 focus-visible:outline-rose-500"
              : "rounded-2xl bg-emerald-600 hover:bg-emerald-700 focus-visible:outline-emerald-500",
          )}
        >
          BUMP — Ready!
        </button>
      </div>
    </div>
  );
}
