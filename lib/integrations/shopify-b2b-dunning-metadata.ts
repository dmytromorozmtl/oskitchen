import type { B2bArAgingSnapshot } from "@/lib/integrations/shopify-b2b-ar-aging-metadata";

export type B2bDunningStats = {
  runs: number;
  digestsSent: number;
  autoRemindersSent: number;
  skippedEmailOff: number;
  skippedDisabled: number;
  skippedRecentDigest: number;
  skippedNoOpenInvoices: number;
};

export type B2bOperatorDigestPreview = {
  computedAt: string;
  openTotal: number;
  openAmountCents: number;
  overdueTotal: number;
  bucket61Plus: number;
  topOverdue: Array<{
    orderId: string;
    invoiceNumber: string;
    companyName: string | null;
    daysPastDue: number;
    openAmountCents: number;
  }>;
  cadenceDays: number[];
  autoDunningEnabled: boolean;
  operatorDigestEnabled: boolean;
  lastDigestAt: string | null;
  lastRunAt: string | null;
};

export function incrementB2bDunningStats(
  current: B2bDunningStats | null | undefined,
  patch: Partial<B2bDunningStats>,
): B2bDunningStats {
  const base: B2bDunningStats = current ?? {
    runs: 0,
    digestsSent: 0,
    autoRemindersSent: 0,
    skippedEmailOff: 0,
    skippedDisabled: 0,
    skippedRecentDigest: 0,
    skippedNoOpenInvoices: 0,
  };
  return {
    runs: base.runs + (patch.runs ?? 0),
    digestsSent: base.digestsSent + (patch.digestsSent ?? 0),
    autoRemindersSent: base.autoRemindersSent + (patch.autoRemindersSent ?? 0),
    skippedEmailOff: base.skippedEmailOff + (patch.skippedEmailOff ?? 0),
    skippedDisabled: base.skippedDisabled + (patch.skippedDisabled ?? 0),
    skippedRecentDigest: base.skippedRecentDigest + (patch.skippedRecentDigest ?? 0),
    skippedNoOpenInvoices: base.skippedNoOpenInvoices + (patch.skippedNoOpenInvoices ?? 0),
  };
}

/** Highest cadence tier (0-based) eligible for an auto reminder, or null. */
export function resolveB2bAutoDunningTier(input: {
  daysPastDue: number;
  reminderCount: number;
  cadenceDays: number[];
}): number | null {
  for (let i = input.cadenceDays.length - 1; i >= 0; i--) {
    const threshold = input.cadenceDays[i];
    if (input.daysPastDue >= threshold && input.reminderCount <= i) {
      return i;
    }
  }
  return null;
}

export function buildB2bOperatorDigestPreview(input: {
  snapshot: B2bArAgingSnapshot;
  cadenceDays: number[];
  autoDunningEnabled: boolean;
  operatorDigestEnabled: boolean;
  lastDigestAt: string | null;
  lastRunAt: string | null;
}): B2bOperatorDigestPreview {
  const overdueRows = input.snapshot.rows.filter((row) => row.bucket !== "current");
  return {
    computedAt: input.snapshot.computedAt,
    openTotal: input.snapshot.openTotal,
    openAmountCents: input.snapshot.openAmountCents,
    overdueTotal: input.snapshot.overdueTotal,
    bucket61Plus: input.snapshot.buckets.days_61_plus,
    topOverdue: overdueRows.slice(0, 8).map((row) => ({
      orderId: row.orderId,
      invoiceNumber: row.invoiceNumber,
      companyName: row.companyName,
      daysPastDue: row.daysPastDue,
      openAmountCents: row.openAmountCents,
    })),
    cadenceDays: input.cadenceDays,
    autoDunningEnabled: input.autoDunningEnabled,
    operatorDigestEnabled: input.operatorDigestEnabled,
    lastDigestAt: input.lastDigestAt,
    lastRunAt: input.lastRunAt,
  };
}
