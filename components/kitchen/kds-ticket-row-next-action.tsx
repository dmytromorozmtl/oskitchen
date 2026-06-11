"use client";

import {
  resolveKdsTicketRowNextAction,
  type KdsTicketFocusOrder,
} from "@/lib/kitchen/kds-ticket-focus-era18";
import { kdsTouchPillClass } from "@/lib/kitchen/kds-touch-targets";
import { cn } from "@/lib/utils";

export function KdsTicketRowNextAction(props: {
  order: KdsTicketFocusOrder;
  canBump: boolean;
  canRecall: boolean;
  pending: boolean;
  blocked: boolean;
  onBump: (orderId: string) => void;
  onRecall: (orderId: string) => void;
}) {
  const action = resolveKdsTicketRowNextAction(props.order, {
    canBump: props.canBump,
    canRecall: props.canRecall,
  });

  if (!action) return null;

  const disabled = props.pending || props.blocked;

  return (
    <button
      type="button"
      disabled={disabled}
      data-testid={`kds-ticket-next-action-${props.order.id}`}
      onClick={() => {
        if (action.kind === "bump") props.onBump(props.order.id);
        else props.onRecall(props.order.id);
      }}
      className={cn(
        kdsTouchPillClass,
        "border disabled:cursor-not-allowed disabled:opacity-60",
        action.tone === "urgent"
          ? "border-destructive/40 bg-destructive/10 text-destructive"
          : "border-primary/30 bg-primary/5 text-primary",
      )}
    >
      {action.label}
    </button>
  );
}
