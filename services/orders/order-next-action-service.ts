import type { OrderStatus } from "@prisma/client";

import type { OrderBlocker } from "@/lib/orders/order-lifecycle-types";
import type { OrderLikeForLifecycle } from "@/lib/workflows/order-lifecycle-rules";
import { listAllowedOrderStatusTransitions } from "@/services/workflows/order-lifecycle-service";

export type OrderNextAction = {
  title: string;
  detail: string;
  href: string;
  variant: "primary" | "secondary";
};

export type OrderNextActionBundle = {
  primary: OrderNextAction | null;
  secondaries: OrderNextAction[];
  blockingSummary: string | null;
};

function tab(orderId: string, t: string) {
  return `/dashboard/orders/${orderId}?tab=${t}`;
}

export function resolveOrderNextActionBundle(input: {
  orderId: string;
  order: OrderLikeForLifecycle;
  blockers: OrderBlocker[];
  customerLinked: boolean;
}): OrderNextActionBundle {
  const { orderId, order, blockers, customerLinked } = input;
  const secondaries: OrderNextAction[] = [];

  const fulfillmentDate = blockers.find((b) => b.code === "MISSING_FULFILLMENT_DATE");
  const deliveryAddr = blockers.find((b) => b.code === "MISSING_DELIVERY_ADDRESS");
  const unmapped = blockers.find((b) => b.code === "UNMAPPED_PRODUCTS");

  if (unmapped) {
    return {
      primary: {
        title: "Resolve product mappings",
        detail: unmapped.explanation,
        href: unmapped.fixHref,
        variant: "primary",
      },
      secondaries: [],
      blockingSummary: unmapped.label,
    };
  }

  const posTxnMissing = blockers.find((b) => b.code === "POS_TRANSACTION_MISSING");
  const receiptMissing = blockers.find((b) => b.code === "RECEIPT_MISSING");
  if (posTxnMissing) {
    return {
      primary: {
        title: "Fix POS transaction link",
        detail: posTxnMissing.explanation,
        href: "/dashboard/pos/transactions",
        variant: "primary",
      },
      secondaries: [],
      blockingSummary: posTxnMissing.label,
    };
  }
  if (receiptMissing) {
    return {
      primary: {
        title: "Review POS receipt",
        detail: receiptMissing.explanation,
        href: "/dashboard/pos/receipts",
        variant: "primary",
      },
      secondaries: [],
      blockingSummary: receiptMissing.label,
    };
  }

  if (deliveryAddr) {
    secondaries.push({
      title: "Link CRM customer",
      detail: "Optional — attach a profile for marketing and history.",
      href: tab(orderId, "customer"),
      variant: "secondary",
    });
    return {
      primary: {
        title: "Add delivery address",
        detail: deliveryAddr.explanation,
        href: tab(orderId, "fulfillment"),
        variant: "primary",
      },
      secondaries,
      blockingSummary: deliveryAddr.label,
    };
  }

  if (fulfillmentDate) {
    secondaries.push({
      title: "Mark pickup as today (edit date)",
      detail: "If this is a same-day pickup, set the service date to today on the Fulfillment tab.",
      href: tab(orderId, "fulfillment"),
      variant: "secondary",
    });
    return {
      primary: {
        title: "Set pickup or service date",
        detail: fulfillmentDate.explanation,
        href: tab(orderId, "fulfillment"),
        variant: "primary",
      },
      secondaries,
      blockingSummary: fulfillmentDate.label,
    };
  }

  const allowed = listAllowedOrderStatusTransitions(order);
  const next = pickNextDbStatus(order.status, allowed);

  if (next === "PREPARING") {
    return {
      primary: {
        title: "Send to production",
        detail: "Kitchen work can start — fulfillment prerequisites are satisfied.",
        href: tab(orderId, "production"),
        variant: "primary",
      },
      secondaries: buildCustomerSecondaries(orderId, customerLinked),
      blockingSummary: null,
    };
  }

  if (next === "READY") {
    return {
      primary: {
        title: "Mark ready for pickup or delivery",
        detail: "Handoff prep is complete for this order’s pipeline stage.",
        href: tab(orderId, "overview"),
        variant: "primary",
      },
      secondaries: buildCustomerSecondaries(orderId, customerLinked),
      blockingSummary: null,
    };
  }

  if (next === "COMPLETED") {
    return {
      primary: {
        title: "Complete order",
        detail: "Closes the order for reporting and customer metrics.",
        href: tab(orderId, "overview"),
        variant: "primary",
      },
      secondaries: buildCustomerSecondaries(orderId, customerLinked),
      blockingSummary: null,
    };
  }

  if (!customerLinked) {
    secondaries.push({
      title: "Link or create CRM customer",
      detail: "Improves history and follow-ups when you capture real contact info.",
      href: tab(orderId, "customer"),
      variant: "secondary",
    });
  }

  return {
    primary: null,
    secondaries,
    blockingSummary: null,
  };
}

function buildCustomerSecondaries(orderId: string, customerLinked: boolean): OrderNextAction[] {
  if (customerLinked) return [];
  return [
    {
      title: "Link CRM customer",
      detail: "Optional — guest checkout is allowed.",
      href: tab(orderId, "customer"),
      variant: "secondary",
    },
  ];
}

function pickNextDbStatus(status: OrderStatus, allowed: OrderStatus[]): OrderStatus | null {
  const priority: OrderStatus[] = ["PREPARING", "READY", "COMPLETED", "CONFIRMED", "PENDING"];
  for (const p of priority) {
    if (allowed.includes(p)) return p;
  }
  return allowed[0] ?? null;
}
