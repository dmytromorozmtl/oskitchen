import type { OrderStatus } from "@prisma/client";

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PREPARING: "In production",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function humanOrderStatus(status: OrderStatus | string): string {
  if (status in ORDER_STATUS_LABEL) return ORDER_STATUS_LABEL[status as OrderStatus];
  return sentenceCaseToken(String(status));
}

/** Converts SCREAMING_SNAKE_CASE tokens to sentence case for incidental enums. */
export function sentenceCaseToken(raw: string): string {
  if (!raw) return "";
  const s = raw.replace(/_/g, " ").toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Known operational phrases — prefer these over raw enum dumps in UI. */
export const OPERATIONAL_PHRASES: Record<string, string> = {
  NEEDS_FULFILLMENT_INFO: "Needs fulfillment details",
  READY_FOR_PRODUCTION: "Ready for production",
  IN_PRODUCTION: "In production",
  READY_FOR_PACKING: "Ready for packing",
  OUT_FOR_DELIVERY: "Out for delivery",
};

export function humanOperationalPhrase(key: string): string {
  return OPERATIONAL_PHRASES[key] ?? sentenceCaseToken(key);
}
