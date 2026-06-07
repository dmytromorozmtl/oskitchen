import type { IntegrationProvider } from "@prisma/client";

import {
  DELIVERY_COMMISSION_BENCHMARK_RATE_PCT,
  DELIVERY_COMMISSION_PROVIDER_LABEL,
  DELIVERY_COMMISSION_PROVIDERS,
  type DeliveryCommissionProvider,
} from "@/lib/delivery/delivery-commission-tracking-absolute-final-policy";

export type DeliveryCommissionSource = "reported" | "estimated" | "none";

export type DeliveryOrderCommissionRow = {
  orderId: string;
  externalOrderId: string | null;
  provider: DeliveryCommissionProvider;
  label: string;
  createdAt: Date;
  grossTotal: number;
  commissionRatePct: number | null;
  commissionAmount: number;
  netPayout: number;
  source: DeliveryCommissionSource;
};

export type DeliveryCommissionChannelSummary = {
  provider: DeliveryCommissionProvider;
  label: string;
  orders: number;
  grossTotal: number;
  commissionTotal: number;
  netPayoutTotal: number;
  reportedCount: number;
  estimatedCount: number;
  avgCommissionRatePct: number | null;
};

export type DeliveryCommissionTrackingSnapshot = {
  rangeLabel: string;
  totalOrders: number;
  grossTotal: number;
  commissionTotal: number;
  netPayoutTotal: number;
  reportedOrderCount: number;
  estimatedOrderCount: number;
  effectiveCommissionRatePct: number | null;
  channels: DeliveryCommissionChannelSummary[];
  orders: DeliveryOrderCommissionRow[];
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function isDeliveryCommissionProvider(
  provider: IntegrationProvider | string | null | undefined,
): provider is DeliveryCommissionProvider {
  return (
    provider != null &&
    (DELIVERY_COMMISSION_PROVIDERS as readonly string[]).includes(provider)
  );
}

function moneyToMajor(value: unknown): number | null {
  if (value == null) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return n >= 1000 ? round2(n / 100) : round2(n);
}

const COMMISSION_AMOUNT_KEYS = [
  "commission",
  "commission_fee",
  "commission_amount",
  "marketplace_commission",
  "platform_fee",
  "service_fee",
  "merchant_commission_fee",
  "merchant_fees",
  "marketplace_fee",
] as const;

const COMMISSION_RATE_KEYS = [
  "commission_rate",
  "commission_rate_pct",
  "marketplace_commission_rate",
  "platform_fee_rate",
] as const;

function walkObjects(
  value: unknown,
  visit: (obj: Record<string, unknown>) => void,
  depth = 0,
): void {
  if (depth > 4 || value == null) return;
  if (Array.isArray(value)) {
    for (const item of value) walkObjects(item, visit, depth + 1);
    return;
  }
  if (typeof value !== "object") return;
  const obj = value as Record<string, unknown>;
  visit(obj);
  for (const nested of Object.values(obj)) {
    walkObjects(nested, visit, depth + 1);
  }
}

/** Extract commission fee or rate from marketplace raw webhook / poll payloads. */
export function extractReportedCommission(raw: unknown): {
  amount: number | null;
  ratePct: number | null;
} {
  let amount: number | null = null;
  let ratePct: number | null = null;

  walkObjects(raw, (obj) => {
    if (amount == null) {
      for (const key of COMMISSION_AMOUNT_KEYS) {
        if (obj[key] != null) {
          const parsed = moneyToMajor(obj[key]);
          if (parsed != null && parsed >= 0) {
            amount = parsed;
            break;
          }
        }
      }
    }
    if (ratePct == null) {
      for (const key of COMMISSION_RATE_KEYS) {
        if (obj[key] != null) {
          const n = Number(obj[key]);
          if (Number.isFinite(n) && n >= 0) {
            ratePct = n <= 1 ? round2(n * 100) : round2(n);
            break;
          }
        }
      }
    }
  });

  return { amount, ratePct };
}

export function resolveDeliveryOrderCommission(input: {
  orderId: string;
  externalOrderId: string | null;
  provider: DeliveryCommissionProvider;
  createdAt: Date;
  grossTotal: number;
  rawPayload?: unknown;
}): DeliveryOrderCommissionRow {
  const grossTotal = round2(Math.max(0, input.grossTotal));
  const reported = extractReportedCommission(input.rawPayload);
  const label = DELIVERY_COMMISSION_PROVIDER_LABEL[input.provider];
  const benchmarkRate = DELIVERY_COMMISSION_BENCHMARK_RATE_PCT[input.provider];

  let commissionAmount = 0;
  let commissionRatePct: number | null = null;
  let source: DeliveryCommissionSource = "none";

  if (reported.amount != null && reported.amount > 0) {
    commissionAmount = round2(reported.amount);
    commissionRatePct =
      grossTotal > 0 ? round2((commissionAmount / grossTotal) * 100) : reported.ratePct;
    source = "reported";
  } else if (reported.ratePct != null && reported.ratePct > 0 && grossTotal > 0) {
    commissionRatePct = reported.ratePct;
    commissionAmount = round2((grossTotal * commissionRatePct) / 100);
    source = "reported";
  } else if (grossTotal > 0) {
    commissionRatePct = benchmarkRate;
    commissionAmount = round2((grossTotal * benchmarkRate) / 100);
    source = "estimated";
  }

  return {
    orderId: input.orderId,
    externalOrderId: input.externalOrderId,
    provider: input.provider,
    label,
    createdAt: input.createdAt,
    grossTotal,
    commissionRatePct,
    commissionAmount,
    netPayout: round2(Math.max(0, grossTotal - commissionAmount)),
    source,
  };
}

function formatRangeLabel(from: Date, to: Date): string {
  return `${from.toISOString().slice(0, 10)} → ${to.toISOString().slice(0, 10)}`;
}

export function buildDeliveryCommissionTrackingSnapshot(input: {
  orders: DeliveryOrderCommissionRow[];
  from: Date;
  to: Date;
}): DeliveryCommissionTrackingSnapshot {
  const channelBuckets = new Map<
    DeliveryCommissionProvider,
    DeliveryCommissionChannelSummary
  >();

  for (const provider of DELIVERY_COMMISSION_PROVIDERS) {
    channelBuckets.set(provider, {
      provider,
      label: DELIVERY_COMMISSION_PROVIDER_LABEL[provider],
      orders: 0,
      grossTotal: 0,
      commissionTotal: 0,
      netPayoutTotal: 0,
      reportedCount: 0,
      estimatedCount: 0,
      avgCommissionRatePct: null,
    });
  }

  let grossTotal = 0;
  let commissionTotal = 0;
  let reportedOrderCount = 0;
  let estimatedOrderCount = 0;

  for (const row of input.orders) {
    grossTotal = round2(grossTotal + row.grossTotal);
    commissionTotal = round2(commissionTotal + row.commissionAmount);
    if (row.source === "reported") reportedOrderCount += 1;
    if (row.source === "estimated") estimatedOrderCount += 1;

    const bucket = channelBuckets.get(row.provider)!;
    bucket.orders += 1;
    bucket.grossTotal = round2(bucket.grossTotal + row.grossTotal);
    bucket.commissionTotal = round2(bucket.commissionTotal + row.commissionAmount);
    bucket.netPayoutTotal = round2(bucket.netPayoutTotal + row.netPayout);
    if (row.source === "reported") bucket.reportedCount += 1;
    if (row.source === "estimated") bucket.estimatedCount += 1;
  }

  const channels = DELIVERY_COMMISSION_PROVIDERS.map((provider) => {
    const bucket = channelBuckets.get(provider)!;
    bucket.avgCommissionRatePct =
      bucket.grossTotal > 0
        ? round2((bucket.commissionTotal / bucket.grossTotal) * 100)
        : null;
    return bucket;
  }).filter((c) => c.orders > 0);

  const netPayoutTotal = round2(grossTotal - commissionTotal);

  return {
    rangeLabel: formatRangeLabel(input.from, input.to),
    totalOrders: input.orders.length,
    grossTotal,
    commissionTotal,
    netPayoutTotal,
    reportedOrderCount,
    estimatedOrderCount,
    effectiveCommissionRatePct:
      grossTotal > 0 ? round2((commissionTotal / grossTotal) * 100) : null,
    channels,
    orders: input.orders.slice().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
  };
}
