/**
 * Operational rate helpers. All functions are pure — the caller
 * supplies pre-fetched aggregates. We never invent numbers when
 * totals are zero; we return null so the UI can render "—".
 */

export type RateBuckets = { numerator: number; denominator: number };

export function safeRate(buckets: RateBuckets): number | null {
  if (buckets.denominator <= 0) return null;
  return Math.round((buckets.numerator / buckets.denominator) * 10000) / 10000;
}

export function ratePercentLabel(rate: number | null): string {
  if (rate == null) return "—";
  return `${Math.round(rate * 1000) / 10}%`;
}

export type DeliveryStopAgg = { status: string; _count: { _all: number } };

export function deliveryCompletionFromAggregate(rows: DeliveryStopAgg[]): RateBuckets {
  let delivered = 0;
  let total = 0;
  for (const r of rows) {
    total += r._count._all;
    if (r.status === "DELIVERED") delivered += r._count._all;
  }
  return { numerator: delivered, denominator: total };
}

export type LateOrderArgs = {
  pickupDate: Date | null;
  status: string;
  now: Date;
};

const NON_LATE_STATUSES = new Set(["READY", "COMPLETED", "CANCELLED"]);

export function isLateOrder(args: LateOrderArgs): boolean {
  if (!args.pickupDate) return false;
  if (NON_LATE_STATUSES.has(args.status)) return false;
  return args.pickupDate.getTime() < args.now.getTime();
}
