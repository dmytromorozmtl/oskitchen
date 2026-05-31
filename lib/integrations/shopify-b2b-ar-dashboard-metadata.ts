import type { B2bArAgingBucket, B2bArAgingRow, B2bArAgingSnapshot } from "@/lib/integrations/shopify-b2b-ar-aging-metadata";
import type { B2bArCollectorQueueSnapshot } from "@/lib/integrations/shopify-b2b-collector-queue-metadata";

export type B2bArCollectionPriority = "critical" | "high" | "medium" | "low";

export type B2bArDashboardRow = B2bArAgingRow & {
  companyAccountId: string | null;
  osMarketId: string | null;
  externalOrderNumber: string | null;
  kitchenPaymentStatus: string | null;
  shopifyFinancialStatus: string | null;
  paymentStatusDrift: boolean;
  payPortalIssued: boolean;
  payPortalCheckoutStarted: boolean;
  collectionPriority: B2bArCollectionPriority;
  assignedCollector: string | null;
};

export type B2bArCompanyRollup = {
  companyKey: string;
  companyName: string;
  companyAccountId: string | null;
  openInvoices: number;
  openAmountCents: number;
  overdueInvoices: number;
  maxDaysPastDue: number;
  assignedCollector: string | null;
  bucketCounts: {
    current: number;
    days_0_30: number;
    days_31_60: number;
    days_61_plus: number;
  };
};

export type B2bArDashboardSnapshot = B2bArAgingSnapshot & {
  rows: B2bArDashboardRow[];
  companies: B2bArCompanyRollup[];
  healthScore: number;
  healthLevel: "healthy" | "attention" | "critical";
  missingPayPortalCount: number;
  shopifyMirrorCount: number;
  paymentStatusDriftCount: number;
  collectorQueue: B2bArCollectorQueueSnapshot | null;
  slaBreachedCount: number;
};

export type B2bArDashboardStats = {
  views: number;
  bulkRemindersSent: number;
  bulkPayLinksMinted: number;
  csvExports: number;
  collectorsAssigned: number;
};

export function resolveCollectionPriority(row: Pick<B2bArAgingRow, "bucket" | "daysPastDue">): B2bArCollectionPriority {
  if (row.bucket === "days_61_plus") return "critical";
  if (row.bucket === "days_31_60") return "high";
  if (row.bucket === "days_0_30") return "medium";
  return "low";
}

export function computeB2bArHealthScore(
  snapshot: Pick<B2bArAgingSnapshot, "openTotal" | "overdueTotal" | "buckets">,
  paymentStatusDriftCount = 0,
  slaBreachedCount = 0,
): number {
  if (snapshot.openTotal === 0) {
    if (slaBreachedCount > 0 || paymentStatusDriftCount > 0) return 90;
    return 100;
  }
  const overdueRatio = snapshot.overdueTotal / snapshot.openTotal;
  const criticalRatio = snapshot.buckets.days_61_plus / snapshot.openTotal;
  let score = 100;
  score -= Math.round(overdueRatio * 35);
  score -= Math.round(criticalRatio * 45);
  score -= snapshot.buckets.days_31_60 * 2;
  score -= paymentStatusDriftCount * 4;
  score -= slaBreachedCount * 8;
  return Math.max(0, Math.min(100, score));
}

export function resolveB2bArHealthLevel(
  score: number,
  paymentStatusDriftCount = 0,
  slaBreachedCount = 0,
): "healthy" | "attention" | "critical" {
  if (slaBreachedCount > 0) return "critical";
  if (paymentStatusDriftCount > 0 && score >= 75) return "attention";
  if (score >= 75) return "healthy";
  if (score >= 45) return "attention";
  return "critical";
}

export function buildB2bArCompanyRollups(
  rows: B2bArDashboardRow[],
  collectorsByCompanyId: Record<string, string>,
): B2bArCompanyRollup[] {
  const map = new Map<string, B2bArCompanyRollup>();

  for (const row of rows) {
    const companyKey = row.companyAccountId ?? row.companyName ?? row.orderId;
    const companyName = row.companyName ?? "Unknown company";
    const existing = map.get(companyKey) ?? {
      companyKey,
      companyName,
      companyAccountId: row.companyAccountId,
      openInvoices: 0,
      openAmountCents: 0,
      overdueInvoices: 0,
      maxDaysPastDue: 0,
      assignedCollector:
        row.companyAccountId && collectorsByCompanyId[row.companyAccountId]
          ? collectorsByCompanyId[row.companyAccountId]
          : null,
      bucketCounts: { current: 0, days_0_30: 0, days_31_60: 0, days_61_plus: 0 },
    };

    existing.openInvoices += 1;
    existing.openAmountCents += row.openAmountCents;
    if (row.bucket !== "current") existing.overdueInvoices += 1;
    existing.maxDaysPastDue = Math.max(existing.maxDaysPastDue, row.daysPastDue);
    existing.bucketCounts[row.bucket] += 1;
    map.set(companyKey, existing);
  }

  return [...map.values()].sort((a, b) => {
    if (b.openAmountCents !== a.openAmountCents) return b.openAmountCents - a.openAmountCents;
    return b.maxDaysPastDue - a.maxDaysPastDue;
  });
}

export function buildB2bArDashboardSnapshot(input: {
  aging: B2bArAgingSnapshot;
  rows: B2bArDashboardRow[];
  collectorsByCompanyId: Record<string, string>;
  collectorQueue?: B2bArCollectorQueueSnapshot | null;
}): B2bArDashboardSnapshot {
  const companies = buildB2bArCompanyRollups(input.rows, input.collectorsByCompanyId);
  const paymentStatusDriftCount = input.rows.filter((row) => row.paymentStatusDrift).length;
  const slaBreachedCount = input.collectorQueue?.slaBreachedCount ?? 0;
  const healthScore = computeB2bArHealthScore(input.aging, paymentStatusDriftCount, slaBreachedCount);
  const healthLevel = resolveB2bArHealthLevel(healthScore, paymentStatusDriftCount, slaBreachedCount);
  const missingPayPortalCount = input.rows.filter(
    (row) => row.bucket !== "current" && !row.payPortalIssued,
  ).length;
  const shopifyMirrorCount = input.rows.filter((row) => row.shopifyFinancialStatus != null).length;

  return {
    ...input.aging,
    rows: input.rows,
    companies,
    healthScore,
    healthLevel,
    missingPayPortalCount,
    shopifyMirrorCount,
    paymentStatusDriftCount,
    collectorQueue: input.collectorQueue ?? null,
    slaBreachedCount,
  };
}

export function incrementB2bArDashboardStats(
  current: B2bArDashboardStats | null | undefined,
  patch: Partial<B2bArDashboardStats>,
): B2bArDashboardStats {
  const base: B2bArDashboardStats = current ?? {
    views: 0,
    bulkRemindersSent: 0,
    bulkPayLinksMinted: 0,
    csvExports: 0,
    collectorsAssigned: 0,
  };
  return {
    views: base.views + (patch.views ?? 0),
    bulkRemindersSent: base.bulkRemindersSent + (patch.bulkRemindersSent ?? 0),
    bulkPayLinksMinted: base.bulkPayLinksMinted + (patch.bulkPayLinksMinted ?? 0),
    csvExports: base.csvExports + (patch.csvExports ?? 0),
    collectorsAssigned: base.collectorsAssigned + (patch.collectorsAssigned ?? 0),
  };
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function b2bArDashboardRowsToCsv(rows: B2bArDashboardRow[]): string {
  const header = [
    "invoice_number",
    "company",
    "po_number",
    "open_amount_cents",
    "due_at",
    "days_past_due",
    "bucket",
    "kitchen_payment_status",
    "shopify_financial_status",
    "payment_status_drift",
    "pay_portal_issued",
    "reminder_count",
    "assigned_collector",
    "order_id",
  ].join(",");

  const lines = rows.map((row) =>
    [
      csvEscape(row.invoiceNumber),
      csvEscape(row.companyName ?? ""),
      csvEscape(row.poNumber ?? ""),
      String(row.openAmountCents),
      csvEscape(row.dueAt ?? ""),
      String(row.daysPastDue),
      csvEscape(row.bucket),
      csvEscape(row.kitchenPaymentStatus ?? ""),
      csvEscape(row.shopifyFinancialStatus ?? ""),
      row.paymentStatusDrift ? "yes" : "no",
      row.payPortalIssued ? "yes" : "no",
      String(row.reminderCount),
      csvEscape(row.assignedCollector ?? ""),
      csvEscape(row.orderId),
    ].join(","),
  );

  return [header, ...lines].join("\n");
}

export function filterDashboardRowsByBucket(
  rows: B2bArDashboardRow[],
  bucket: B2bArAgingBucket | "all" | "overdue",
): B2bArDashboardRow[] {
  if (bucket === "all") return rows;
  if (bucket === "overdue") return rows.filter((row) => row.bucket !== "current");
  return rows.filter((row) => row.bucket === bucket);
}
