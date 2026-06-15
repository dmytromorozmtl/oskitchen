import type { OrderStatus } from "@prisma/client";

import type {
  OrderBlocker,
  OrderBlockerCode,
  OrderLifecycleIntent,
  OrderLifecycleStage,
} from "@/lib/orders/order-lifecycle-types";
import {
  validateOrderDbStatusTransition,
  type OrderLikeForLifecycle,
} from "@/lib/workflows/order-lifecycle-rules";

export type LifecycleGuardResult =
  | { ok: true; targetDbStatus?: OrderStatus }
  | { ok: false; message: string; fixHref?: string };

const TERMINAL: OrderLifecycleStage[] = ["COMPLETED", "CANCELLED"];

export function isTerminalLifecycleStage(s: OrderLifecycleStage): boolean {
  return TERMINAL.includes(s);
}

/** Maps high-level intent to the next **Prisma** `OrderStatus` hop (single enum step). */
export function intentToDbStatus(intent: OrderLifecycleIntent): OrderStatus | null {
  switch (intent) {
    case "CONFIRM":
      return "CONFIRMED";
    case "SEND_TO_PRODUCTION":
    case "MARK_PRODUCTION_DONE":
      return "PREPARING";
    case "SEND_TO_PACKING":
    case "MARK_PACKED":
      return "PREPARING";
    case "MARK_READY":
    case "ASSIGN_ROUTE":
      return "READY";
    case "COMPLETE":
      return "COMPLETED";
    case "CANCEL":
      return "CANCELLED";
    case "HOLD":
    case "RESUME":
      return null;
    default:
      return null;
  }
}

export function validateIntentAgainstDb(
  order: OrderLikeForLifecycle,
  intent: OrderLifecycleIntent,
  blockers: OrderBlocker[],
): LifecycleGuardResult {
  const target = intentToDbStatus(intent);
  if (target == null) {
    return { ok: false, message: "This action is not available as a single status update yet." };
  }
  const critical = new Set<OrderBlockerCode>([
    "MISSING_ITEMS",
    "UNMAPPED_PRODUCTS",
    "INTEGRATION_ERROR",
    "POS_TRANSACTION_MISSING",
  ]);
  if (intent === "SEND_TO_PRODUCTION" || intent === "CONFIRM") {
    const bad = blockers.filter((b) => critical.has(b.code));
    const fulfillment = blockers.filter((b) =>
      ["MISSING_FULFILLMENT_DATE", "MISSING_DELIVERY_ADDRESS"].includes(b.code),
    );
    if (intent === "SEND_TO_PRODUCTION" && fulfillment.length > 0) {
      return { ok: false, message: fulfillment[0].explanation, fixHref: fulfillment[0].fixHref };
    }
    if (bad.length > 0) {
      return { ok: false, message: bad[0].explanation, fixHref: bad[0].fixHref };
    }
  }
  if (intent === "COMPLETE") {
    const pay = blockers.find((b) => b.code === "PAYMENT_REVIEW_REQUIRED");
    if (pay) return { ok: false, message: pay.explanation, fixHref: pay.fixHref };
    const pack = blockers.find((b) => b.code === "PACKING_NOT_COMPLETE");
    if (pack) return { ok: false, message: pack.explanation, fixHref: pack.fixHref };
    const prod = blockers.find((b) => b.code === "PRODUCTION_NOT_COMPLETE");
    if (prod) return { ok: false, message: prod.explanation, fixHref: prod.fixHref };
  }
  return validateOrderDbStatusTransition(order, target);
}
