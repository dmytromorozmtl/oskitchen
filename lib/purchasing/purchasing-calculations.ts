import type { PurchaseOrderStatus } from "@prisma/client";

export function lineTotalCost(quantity: number, unitCost: number): number {
  return Math.round(quantity * unitCost * 100) / 100;
}

export function sumMoney(values: number[]): number {
  return Math.round(values.reduce((a, b) => a + b, 0) * 100) / 100;
}

/** Heuristic overdue: sent but past requested delivery and not fully received. */
export function deriveDisplayOverdue(
  status: PurchaseOrderStatus,
  requestedDeliveryDate: Date | null,
  now: Date,
): boolean {
  if (!requestedDeliveryDate) return false;
  if (status !== "SENT" && status !== "PARTIALLY_RECEIVED" && status !== "APPROVED") return false;
  const d = new Date(requestedDeliveryDate);
  d.setHours(23, 59, 59, 999);
  return d < now;
}
