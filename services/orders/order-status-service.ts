import type { OrderStatus } from "@prisma/client";

import type { OrderPaymentOpsStatus } from "@/lib/orders/order-lifecycle-types";
import {
  ORDER_STATUS_KEYS,
  type OrderStatusKey,
  toDbOrderStatus,
} from "@/lib/orders/order-status";

/** Maps free-text payment fields to an operational payment bucket for UI. */
export function normalizePaymentOpsStatus(
  paymentStatus: string | null | undefined,
  paymentMode: string | null | undefined,
): OrderPaymentOpsStatus {
  const ps = (paymentStatus ?? "").toLowerCase().trim();
  const pm = (paymentMode ?? "").toLowerCase().trim();

  if (!ps && !pm) return "NOT_REQUIRED";
  if (pm.includes("external")) return "PAID_EXTERNALLY";
  if (pm.includes("later") || pm.includes("invoice")) return "PAY_LATER";
  if (pm.includes("request")) return "REQUEST_ONLY";

  if (ps === "paid") return "PAID";
  if (ps === "partial") return "PARTIALLY_PAID";
  if (ps === "pending") return "PENDING";
  if (ps === "failed") return "FAILED";
  if (ps === "refunded" || ps.includes("refund")) return "REFUNDED_PLACEHOLDER";
  if (ps === "not_required" || ps === "external") return "NOT_REQUIRED";

  return "PENDING";
}

export function paymentAllowsCompletion(paymentStatus: string | null | undefined): boolean {
  const ps = (paymentStatus ?? "").toLowerCase().trim();
  if (!ps) return true;
  return ["paid", "partial", "external", "not_required"].includes(ps);
}

export function isOrderStatusKey(value: string | null | undefined): value is OrderStatusKey {
  if (!value) return false;
  return (ORDER_STATUS_KEYS as readonly string[]).includes(value);
}

/**
 * Keeps `status` (Prisma enum) and `statusDetail` (widened string) aligned.
 * Call from every order status transition path.
 */
export function resolveOrderStatusFields(input: {
  status?: OrderStatus | null;
  statusDetail?: string | null;
}): { status: OrderStatus; statusDetail: OrderStatusKey } {
  const detailRaw = (input.statusDetail ?? "").trim().toUpperCase();
  if (isOrderStatusKey(detailRaw)) {
    return { status: toDbOrderStatus(detailRaw), statusDetail: detailRaw };
  }

  const enumStatus = input.status ?? "PENDING";
  const detailFromEnum = enumToDefaultDetail(enumStatus);
  return { status: enumStatus, statusDetail: detailFromEnum };
}

function enumToDefaultDetail(status: OrderStatus): OrderStatusKey {
  switch (status) {
    case "PENDING":
      return "REQUESTED";
    case "CONFIRMED":
      return "CONFIRMED";
    case "PREPARING":
      return "IN_PRODUCTION";
    case "READY":
      return "READY_FOR_PICKUP";
    case "COMPLETED":
      return "COMPLETED";
    case "CANCELLED":
      return "CANCELLED";
    default:
      return "REQUESTED";
  }
}

export type OrderStatusUpdateInput = {
  status?: OrderStatus | null;
  statusDetail?: string | null;
};

/** Prisma `data` fragment for a status change. */
export function buildOrderStatusUpdate(input: OrderStatusUpdateInput): {
  status: OrderStatus;
  statusDetail: string;
} {
  const resolved = resolveOrderStatusFields(input);
  return { status: resolved.status, statusDetail: resolved.statusDetail };
}
