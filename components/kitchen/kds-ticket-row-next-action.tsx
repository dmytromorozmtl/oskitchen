"use client";

import {
  resolveKdsTicketRowNextAction,
  type KdsTicketFocusOrder,
} from "@/lib/kitchen/kds-ticket-focus-era18";
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
        "text-xs font-medium hover:underline disabled:cursor-not-allowed disabled:opacity-60",
        action.tone === "urgent" ? "text-destructive" : "text-primary",
      )}
    >
      {action.label}
    </button>
  );
}
