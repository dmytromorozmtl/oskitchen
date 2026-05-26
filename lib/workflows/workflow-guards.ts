import type { FulfillmentType, OrderStatus } from "@prisma/client";

import type { FoodOpsPhaseId } from "./workflow-types";
import { foodOpsPhaseFromOrder, resolveOrderStatusKey } from "./workflow-status";
import { requiresScheduledServiceDate } from "@/lib/fulfillment/fulfillment-requirements";

export type OrderGuardContext = {
  fulfillmentType: "PICKUP" | "DELIVERY" | string;
  deliveryAddressJson: unknown | null;
  paymentStatus: string | null;
  customerName: string;
  customerEmail: string;
  orderType?: string | null;
  creationSource?: string | null;
  fulfillmentDetail?: string | null;
  pickupDate?: Date | null;
  sourceMetadataJson?: unknown;
};

export function listTransitionGuardFailures(
  ctx: OrderGuardContext,
  target: FoodOpsPhaseId,
): string[] {
  const failures: string[] = [];
  if (!ctx.customerName?.trim()) failures.push("Customer name is required.");
  if (!ctx.customerEmail?.trim()) failures.push("Customer email is required.");

  if (target === "OUT_FOR_DELIVERY" || target === "PACKED" || target === "READY_FOR_PICKUP") {
    if (ctx.fulfillmentType === "DELIVERY") {
      if (ctx.deliveryAddressJson == null) failures.push("Delivery address is required for delivery.");
    }
  }

  if (target === "COMPLETED") {
    const ps = (ctx.paymentStatus ?? "").toLowerCase();
    if (ps && ps !== "paid" && ps !== "not_required" && ps !== "external") {
      failures.push("Resolve payment status before completing (paid, not_required, or external).");
    }
  }

  return failures;
}

export function listActiveBranchesForOrder(order: {
  status: OrderStatus;
  statusDetail?: string | null;
  orderType?: string | null;
  creationSource?: string | null;
  fulfillmentType: string;
  fulfillmentDetail?: string | null;
  pickupDate?: Date | null;
  sourceMetadataJson?: unknown;
  deliveryAddressJson: unknown | null;
  paymentStatus?: string | null;
  customerName: string;
  customerEmail: string;
}): string[] {
  const branches: string[] = [];
  const key = resolveOrderStatusKey(order);
  if (key === "CANCELLED") branches.push("CANCELLED");

  if (order.fulfillmentType === "DELIVERY" && !order.deliveryAddressJson) {
    branches.push("NEEDS_ADDRESS");
  }
  const ps = (order.paymentStatus ?? "").toLowerCase();
  if (ps === "unpaid" || ps === "pending") branches.push("NEEDS_PAYMENT");

  if (!order.customerName?.trim() || !order.customerEmail?.trim()) {
    branches.push("NEEDS_CUSTOMER_INFO");
  }

  const fulfillmentCtx = {
    status: order.status,
    orderType: order.orderType ?? null,
    creationSource: order.creationSource ?? null,
    fulfillmentType: order.fulfillmentType as FulfillmentType,
    fulfillmentDetail: order.fulfillmentDetail ?? null,
    pickupDate: order.pickupDate ?? null,
    deliveryAddressJson: order.deliveryAddressJson,
    sourceMetadataJson: order.sourceMetadataJson ?? null,
  };

  if (
    order.status === "CONFIRMED" &&
    requiresScheduledServiceDate(fulfillmentCtx) &&
    (order.pickupDate == null)
  ) {
    branches.push("NEEDS_FULFILLMENT_SCHEDULING");
  }

  const phase = foodOpsPhaseFromOrder(order);
  if (
    (phase === "ORDER_CREATED" || phase === "ORDER_CONFIRMED") &&
    !branches.includes("NEEDS_FULFILLMENT_SCHEDULING")
  ) {
    branches.push("NEEDS_PRODUCTION");
  }

  return branches;
}
