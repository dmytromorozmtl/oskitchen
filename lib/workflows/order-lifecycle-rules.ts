import type { FulfillmentType, OrderStatus } from "@prisma/client";

import { requiresScheduledServiceDate } from "@/lib/fulfillment/fulfillment-requirements";

export const ORDER_DB_STATUSES: readonly OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "COMPLETED",
  "CANCELLED",
] as const;

export function isValidOrderDbStatus(value: string): value is OrderStatus {
  return (ORDER_DB_STATUSES as readonly string[]).includes(value);
}

/** Allowed Prisma enum transitions (kitchen pipeline). */
const ALLOWED: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "PENDING", "CANCELLED"],
  PREPARING: ["READY", "CONFIRMED", "CANCELLED"],
  READY: ["COMPLETED", "PREPARING", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function allowedNextDbStatuses(from: OrderStatus): OrderStatus[] {
  return ALLOWED[from] ?? [];
}

export type OrderLikeForLifecycle = {
  id: string;
  status: OrderStatus;
  fulfillmentType: FulfillmentType;
  fulfillmentDetail?: string | null;
  orderType?: string | null;
  creationSource?: string | null;
  sourceMetadataJson?: unknown;
  pickupDate?: Date | null;
  deliveryAddressJson: unknown | null;
  paymentStatus: string | null;
  orderItemsCount: number;
};

export type OrderLifecycleGuardResult =
  | { ok: true }
  | { ok: false; message: string; fixHref?: string };

/**
 * Validates a single hop on the Prisma `OrderStatus` enum (not widened `statusDetail`).
 * Callers still persist `status` only; `statusDetail` can be advanced by dedicated flows later.
 */
export function validateOrderDbStatusTransition(
  order: OrderLikeForLifecycle,
  to: OrderStatus,
): OrderLifecycleGuardResult {
  if (order.status === to) {
    return { ok: false, message: "Order is already at this status." };
  }
  if (!allowedNextDbStatuses(order.status).includes(to)) {
    return {
      ok: false,
      message: `Cannot move from ${order.status.replace(/_/g, " ")} to ${to.replace(/_/g, " ")}.`,
    };
  }

  if (
    order.orderItemsCount === 0 &&
    (to === "CONFIRMED" || to === "PREPARING" || to === "READY" || to === "COMPLETED")
  ) {
    return {
      ok: false,
      message: "Add at least one line item before advancing this order.",
      fixHref: `/dashboard/orders/${order.id}`,
    };
  }

  if (to === "PREPARING") {
    const needsDate = requiresScheduledServiceDate({
      status: order.status,
      orderType: order.orderType ?? null,
      creationSource: order.creationSource ?? null,
      fulfillmentType: order.fulfillmentType,
      fulfillmentDetail: order.fulfillmentDetail ?? null,
      pickupDate: order.pickupDate ?? null,
      deliveryAddressJson: order.deliveryAddressJson,
      sourceMetadataJson: order.sourceMetadataJson ?? null,
    });
    if (needsDate && order.pickupDate == null) {
      return {
        ok: false,
        message: "Set a pickup or service date before sending this order to production.",
        fixHref: `/dashboard/orders/${order.id}?tab=fulfillment`,
      };
    }
  }

  if (
    order.fulfillmentType === "DELIVERY" &&
    order.deliveryAddressJson == null &&
    (to === "READY" || to === "COMPLETED")
  ) {
    return {
      ok: false,
      message: "Delivery orders need a saved delivery address before ready or complete.",
      fixHref: `/dashboard/orders/${order.id}`,
    };
  }

  const ps = (order.paymentStatus ?? "").toLowerCase();
  if (
    to === "COMPLETED" &&
    ps &&
    !["paid", "not_required", "external", "partial"].includes(ps)
  ) {
    return {
      ok: false,
      message: "Resolve payment status to paid, partial, external, or not_required before completing.",
      fixHref: `/dashboard/orders/${order.id}`,
    };
  }

  return { ok: true };
}
