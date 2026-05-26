import type { CustomerStatus } from "@prisma/client";

/**
 * Pure helpers for deriving customer metrics. All arithmetic is in integer
 * cents so we stay consistent with Order.total (Decimal stored as dollars in
 * the schema — we convert at the boundary).
 */

export type CustomerMetricsAggregate = {
  totalOrders: number;
  lifetimeValueCents: number;
  averageOrderValueCents: number;
  firstOrderAt: Date | null;
  lastOrderAt: Date | null;
  repeatPurchaseRate: number | null;
  atRiskScore: number | null;
};

export function dollarsToCents(value: string | number): number {
  if (typeof value === "number") return Math.round(value * 100);
  const cleaned = value.replace(/[^0-9.\-]/g, "");
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

export function centsToDollars(cents: number): number {
  return Math.round(cents) / 100;
}

export function aggregateFromOrders(orders: ReadonlyArray<{ total: number; createdAt: Date }>): CustomerMetricsAggregate {
  if (orders.length === 0) {
    return {
      totalOrders: 0,
      lifetimeValueCents: 0,
      averageOrderValueCents: 0,
      firstOrderAt: null,
      lastOrderAt: null,
      repeatPurchaseRate: null,
      atRiskScore: null,
    };
  }

  let totalCents = 0;
  let first: Date = orders[0].createdAt;
  let last: Date = orders[0].createdAt;
  for (const o of orders) {
    totalCents += Math.round(o.total * 100);
    if (o.createdAt < first) first = o.createdAt;
    if (o.createdAt > last) last = o.createdAt;
  }
  const aov = Math.round(totalCents / orders.length);
  const repeatPurchaseRate = orders.length > 1 ? Math.min(1, (orders.length - 1) / orders.length) : null;
  const atRiskScore = computeAtRiskScore(last, orders.length, new Date());
  return {
    totalOrders: orders.length,
    lifetimeValueCents: totalCents,
    averageOrderValueCents: aov,
    firstOrderAt: first,
    lastOrderAt: last,
    repeatPurchaseRate,
    atRiskScore,
  };
}

/**
 * 0–100 score where higher = higher risk of churn.
 * Heuristic only — UI labels this as a hint, not a guarantee.
 */
export function computeAtRiskScore(lastOrderAt: Date | null, totalOrders: number, now: Date): number | null {
  if (!lastOrderAt || totalOrders === 0) return null;
  const days = Math.floor((now.getTime() - lastOrderAt.getTime()) / (1000 * 60 * 60 * 24));
  // Sliding scale: 0d → 0, 30d → 25, 60d → 50, 90d → 70, 180d+ → 95
  if (days <= 14) return 0;
  if (days <= 30) return 10;
  if (days <= 45) return 25;
  if (days <= 60) return 45;
  if (days <= 90) return 70;
  if (days <= 180) return 90;
  return 95;
}

export function deriveStatusFromMetrics(
  current: CustomerStatus,
  totalOrders: number,
  atRiskScore: number | null,
): CustomerStatus {
  // Never override manual VIP / BLOCKED / ARCHIVED. The CRM stays operator-led.
  if (current === "VIP" || current === "BLOCKED" || current === "ARCHIVED") return current;
  if (totalOrders === 0) return current === "NEW" ? "NEW" : current;
  if (atRiskScore != null && atRiskScore >= 70) return "AT_RISK";
  return "ACTIVE";
}
