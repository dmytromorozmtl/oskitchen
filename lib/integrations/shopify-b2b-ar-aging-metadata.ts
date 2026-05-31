import {
  isB2bInvoiceDraftOpen,
  isB2bInvoiceOverdue,
  type B2bInvoiceDraftLink,
} from "@/lib/integrations/shopify-b2b-invoice-draft-metadata";

export type B2bArAgingBucket = "current" | "days_0_30" | "days_31_60" | "days_61_plus";

export type B2bArAgingRow = {
  orderId: string;
  invoiceNumber: string;
  invoiceId: string;
  companyName: string | null;
  poNumber: string | null;
  amountCents: number;
  openAmountCents: number;
  dueAt: string | null;
  daysPastDue: number;
  bucket: B2bArAgingBucket;
  customerEmail: string | null;
  customerName: string | null;
  lastReminderAt: string | null;
  reminderCount: number;
};

export type B2bArAgingBucketCounts = {
  current: number;
  days_0_30: number;
  days_31_60: number;
  days_61_plus: number;
};

export type B2bArAgingSnapshot = {
  computedAt: string;
  openTotal: number;
  openAmountCents: number;
  overdueTotal: number;
  buckets: B2bArAgingBucketCounts;
  bucketAmountCents: B2bArAgingBucketCounts;
  rows: B2bArAgingRow[];
};

export type B2bArAgingStats = {
  lastSnapshotOpen: number;
  bucket0_30: number;
  bucket31_60: number;
  bucket61Plus: number;
  remindersSent: number;
  remindersSkipped: number;
};

export function computeB2bInvoiceDaysPastDue(
  draft: B2bInvoiceDraftLink,
  nowMs: number,
  graceDays = 0,
): number {
  if (!draft.dueAt) return 0;
  const dueMs = new Date(draft.dueAt).getTime();
  if (!Number.isFinite(dueMs)) return 0;
  const graceMs = graceDays * 86400000;
  const diffMs = nowMs - (dueMs + graceMs);
  if (diffMs <= 0) return 0;
  return Math.floor(diffMs / 86400000);
}

export function assignB2bArAgingBucket(daysPastDue: number): B2bArAgingBucket {
  if (daysPastDue <= 0) return "current";
  if (daysPastDue <= 30) return "days_0_30";
  if (daysPastDue <= 60) return "days_31_60";
  return "days_61_plus";
}

export function buildB2bArAgingRow(input: {
  orderId: string;
  customerEmail: string | null;
  customerName: string | null;
  draft: B2bInvoiceDraftLink;
  nowMs: number;
  graceDays?: number;
}): B2bArAgingRow | null {
  if (!isB2bInvoiceDraftOpen(input.draft)) return null;

  const paidCents = input.draft.paidAmountCents ?? 0;
  const openAmountCents = Math.max(0, input.draft.amountCents - paidCents);
  if (openAmountCents <= 0) return null;

  const daysPastDue = computeB2bInvoiceDaysPastDue(input.draft, input.nowMs, input.graceDays ?? 0);
  const overdue = isB2bInvoiceOverdue(input.draft, input.nowMs, input.graceDays ?? 0);

  return {
    orderId: input.orderId,
    invoiceNumber: input.draft.invoiceNumber,
    invoiceId: input.draft.invoiceId,
    companyName: input.draft.companyName,
    poNumber: input.draft.poNumber,
    amountCents: input.draft.amountCents,
    openAmountCents,
    dueAt: input.draft.dueAt,
    daysPastDue: overdue ? daysPastDue : 0,
    bucket: overdue ? assignB2bArAgingBucket(daysPastDue) : "current",
    customerEmail: input.customerEmail,
    customerName: input.customerName,
    lastReminderAt: input.draft.lastReminderAt ?? null,
    reminderCount: input.draft.reminderCount ?? 0,
  };
}

export function buildB2bArAgingSnapshot(rows: B2bArAgingRow[], computedAt?: string): B2bArAgingSnapshot {
  const buckets: B2bArAgingBucketCounts = {
    current: 0,
    days_0_30: 0,
    days_31_60: 0,
    days_61_plus: 0,
  };
  const bucketAmountCents: B2bArAgingBucketCounts = {
    current: 0,
    days_0_30: 0,
    days_31_60: 0,
    days_61_plus: 0,
  };

  let openAmountCents = 0;
  let overdueTotal = 0;

  for (const row of rows) {
    buckets[row.bucket] += 1;
    bucketAmountCents[row.bucket] += row.openAmountCents;
    openAmountCents += row.openAmountCents;
    if (row.bucket !== "current") overdueTotal += 1;
  }

  const sorted = [...rows].sort((a, b) => {
    if (b.daysPastDue !== a.daysPastDue) return b.daysPastDue - a.daysPastDue;
    return b.openAmountCents - a.openAmountCents;
  });

  return {
    computedAt: computedAt ?? new Date().toISOString(),
    openTotal: rows.length,
    openAmountCents,
    overdueTotal,
    buckets,
    bucketAmountCents,
    rows: sorted,
  };
}

export function snapshotToB2bArAgingStats(snapshot: B2bArAgingSnapshot): B2bArAgingStats {
  return {
    lastSnapshotOpen: snapshot.openTotal,
    bucket0_30: snapshot.buckets.days_0_30,
    bucket31_60: snapshot.buckets.days_31_60,
    bucket61Plus: snapshot.buckets.days_61_plus,
    remindersSent: 0,
    remindersSkipped: 0,
  };
}

export function incrementB2bArAgingStats(
  current: B2bArAgingStats | null | undefined,
  patch: Partial<B2bArAgingStats>,
): B2bArAgingStats {
  const base: B2bArAgingStats = current ?? {
    lastSnapshotOpen: 0,
    bucket0_30: 0,
    bucket31_60: 0,
    bucket61Plus: 0,
    remindersSent: 0,
    remindersSkipped: 0,
  };
  return {
    lastSnapshotOpen: patch.lastSnapshotOpen ?? base.lastSnapshotOpen,
    bucket0_30: patch.bucket0_30 ?? base.bucket0_30,
    bucket31_60: patch.bucket31_60 ?? base.bucket31_60,
    bucket61Plus: patch.bucket61Plus ?? base.bucket61Plus,
    remindersSent: base.remindersSent + (patch.remindersSent ?? 0),
    remindersSkipped: base.remindersSkipped + (patch.remindersSkipped ?? 0),
  };
}

export function patchInvoiceDraftReminderSent(
  draft: B2bInvoiceDraftLink,
  sentAt: string,
): B2bInvoiceDraftLink {
  return {
    ...draft,
    lastReminderAt: sentAt,
    reminderCount: (draft.reminderCount ?? 0) + 1,
  };
}
