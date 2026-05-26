import type { OrderStatus } from "@prisma/client";

import {
  ORDER_STATUS_KEYS,
  type OrderStatusKey,
  toDbOrderStatus,
} from "@/lib/orders/order-status";

import type { FoodOpsPhaseId } from "./workflow-types";

const ORDER_STATUS_KEY_SET = new Set<string>(ORDER_STATUS_KEYS);

export function normalizeOrderStatusDetail(detail: string | null | undefined): OrderStatusKey | null {
  if (!detail) return null;
  const t = detail.trim();
  if (ORDER_STATUS_KEY_SET.has(t)) return t as OrderStatusKey;
  return null;
}

/** Derive widened status key from persisted Prisma enum + optional detail string. */
export function resolveOrderStatusKey(order: {
  status: OrderStatus;
  statusDetail?: string | null;
}): OrderStatusKey {
  const fromDetail = normalizeOrderStatusDetail(order.statusDetail);
  if (fromDetail) return fromDetail;
  switch (order.status) {
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

/** Map widened / legacy status to canonical FoodOps phase id for dashboards. */
export function foodOpsPhaseFromStatusKey(key: OrderStatusKey): FoodOpsPhaseId {
  switch (key) {
    case "DRAFT":
    case "REQUESTED":
      return "ORDER_CREATED";
    case "CONFIRMED":
      return "ORDER_CONFIRMED";
    case "IN_PRODUCTION":
      return "IN_PRODUCTION";
    case "READY_FOR_PACKING":
      return "READY_FOR_PACKING";
    case "PACKED":
      return "PACKING";
    case "READY_FOR_PICKUP":
      return "READY_FOR_PICKUP";
    case "OUT_FOR_DELIVERY":
      return "OUT_FOR_DELIVERY";
    case "COMPLETED":
      return "COMPLETED";
    case "CANCELLED":
      return "CANCELLED";
    default:
      return "ORDER_CREATED";
  }
}

export function foodOpsPhaseFromOrder(order: {
  status: OrderStatus;
  statusDetail?: string | null;
}): FoodOpsPhaseId {
  return foodOpsPhaseFromStatusKey(resolveOrderStatusKey(order));
}

export { toDbOrderStatus };
