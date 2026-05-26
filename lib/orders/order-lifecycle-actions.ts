import type { OrderLifecycleIntent } from "@/lib/orders/order-lifecycle-types";

export const ORDER_LIFECYCLE_INTENT_LABEL: Record<OrderLifecycleIntent, { title: string; destructive?: boolean }> = {
  CONFIRM: { title: "Confirm order" },
  SEND_TO_PRODUCTION: { title: "Send to production" },
  MARK_PRODUCTION_DONE: { title: "Mark production complete" },
  SEND_TO_PACKING: { title: "Send to packing" },
  MARK_PACKED: { title: "Mark packed" },
  ASSIGN_ROUTE: { title: "Assign route" },
  MARK_READY: { title: "Mark ready" },
  COMPLETE: { title: "Complete order", destructive: true },
  CANCEL: { title: "Cancel order", destructive: true },
  HOLD: { title: "Place on hold" },
  RESUME: { title: "Resume" },
};

export function listIntentsForStage(): OrderLifecycleIntent[] {
  return [
    "CONFIRM",
    "SEND_TO_PRODUCTION",
    "MARK_READY",
    "COMPLETE",
    "CANCEL",
  ];
}
