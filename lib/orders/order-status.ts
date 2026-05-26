import type { OrderStatus } from "@prisma/client";

/**
 * Widened order status. Stored as a string in `Order.statusDetail` so
 * we don't perform a destructive migration on the existing enum.
 */
export const ORDER_STATUS_KEYS = [
  "DRAFT",
  "REQUESTED",
  "CONFIRMED",
  "IN_PRODUCTION",
  "READY_FOR_PACKING",
  "PACKED",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
  "CANCELLED",
] as const;
export type OrderStatusKey = (typeof ORDER_STATUS_KEYS)[number];

export const ORDER_STATUS_LABEL: Record<OrderStatusKey, string> = {
  DRAFT: "Draft",
  REQUESTED: "Requested",
  CONFIRMED: "Confirmed",
  IN_PRODUCTION: "In production",
  READY_FOR_PACKING: "Ready for packing",
  PACKED: "Packed",
  READY_FOR_PICKUP: "Ready for pickup",
  OUT_FOR_DELIVERY: "Out for delivery",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const TONE: Record<OrderStatusKey, "neutral" | "info" | "success" | "warning" | "danger"> = {
  DRAFT: "neutral",
  REQUESTED: "info",
  CONFIRMED: "info",
  IN_PRODUCTION: "warning",
  READY_FOR_PACKING: "warning",
  PACKED: "warning",
  READY_FOR_PICKUP: "info",
  OUT_FOR_DELIVERY: "info",
  COMPLETED: "success",
  CANCELLED: "danger",
};

export function orderStatusTone(s: OrderStatusKey): "neutral" | "info" | "success" | "warning" | "danger" {
  return TONE[s];
}

/** Map widened status back to the DB enum (which only has 6 values). */
export function toDbOrderStatus(s: OrderStatusKey): OrderStatus {
  switch (s) {
    case "DRAFT":
    case "REQUESTED":
      return "PENDING";
    case "CONFIRMED":
      return "CONFIRMED";
    case "IN_PRODUCTION":
    case "READY_FOR_PACKING":
    case "PACKED":
      return "PREPARING";
    case "READY_FOR_PICKUP":
    case "OUT_FOR_DELIVERY":
      return "READY";
    case "COMPLETED":
      return "COMPLETED";
    case "CANCELLED":
      return "CANCELLED";
  }
}
