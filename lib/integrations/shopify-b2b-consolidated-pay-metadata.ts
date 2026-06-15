import { B2B_CONSOLIDATED_PAY_STALE_CHECKOUT_MS } from "@/lib/commercial/shopify-market-b2b-consolidated-pay";

export type B2bConsolidatedPayBatch = {
  batchId: string;
  orderIds: string[];
  invoiceIds: string[];
  invoiceNumbers: string[];
  totalAmountCents: number;
  currency: string;
  companyName: string | null;
  mintedAt: string;
  checkoutStartedAt: string | null;
  checkoutCompletedAt: string | null;
};

export type B2bConsolidatedPayLine = {
  orderId: string;
  invoiceId: string;
  invoiceNumber: string;
  companyName: string | null;
  amountDueCents: number;
  currency: string;
  dueAt: string | null;
  status: string;
};

export type B2bConsolidatedPayView = {
  businessName: string;
  batchId: string;
  invoiceCount: number;
  totalAmountCents: number;
  currency: string;
  totalAmountLabel: string;
  lines: B2bConsolidatedPayLine[];
  stripeCheckoutAvailable: boolean;
  achInstructions: string;
  honesty: string;
  allPaid: boolean;
  companyName: string | null;
};

export type B2bConsolidatedPayStats = {
  batchesMinted: number;
  checkoutStarted: number;
  checkoutCompleted: number;
  staleCheckoutOpen: number;
  skippedAlreadyPaid: number;
  skippedMixedCurrency: number;
  skippedTooFew: number;
};

export function incrementB2bConsolidatedPayStats(
  current: B2bConsolidatedPayStats | null | undefined,
  patch: Partial<B2bConsolidatedPayStats>,
): B2bConsolidatedPayStats {
  const base: B2bConsolidatedPayStats = current ?? {
    batchesMinted: 0,
    checkoutStarted: 0,
    checkoutCompleted: 0,
    staleCheckoutOpen: 0,
    skippedAlreadyPaid: 0,
    skippedMixedCurrency: 0,
    skippedTooFew: 0,
  };
  return {
    batchesMinted: base.batchesMinted + (patch.batchesMinted ?? 0),
    checkoutStarted: base.checkoutStarted + (patch.checkoutStarted ?? 0),
    checkoutCompleted: base.checkoutCompleted + (patch.checkoutCompleted ?? 0),
    staleCheckoutOpen: patch.staleCheckoutOpen ?? base.staleCheckoutOpen,
    skippedAlreadyPaid: base.skippedAlreadyPaid + (patch.skippedAlreadyPaid ?? 0),
    skippedMixedCurrency: base.skippedMixedCurrency + (patch.skippedMixedCurrency ?? 0),
    skippedTooFew: base.skippedTooFew + (patch.skippedTooFew ?? 0),
  };
}

export function upsertB2bConsolidatedPayBatch(
  current: Record<string, B2bConsolidatedPayBatch> | null | undefined,
  batch: B2bConsolidatedPayBatch,
  maxStored = 50,
): Record<string, B2bConsolidatedPayBatch> {
  const next = { ...(current ?? {}), [batch.batchId]: batch };
  const entries = Object.entries(next).sort(
    (a, b) => new Date(b[1].mintedAt).getTime() - new Date(a[1].mintedAt).getTime(),
  );
  if (entries.length <= maxStored) return Object.fromEntries(entries);
  return Object.fromEntries(entries.slice(0, maxStored));
}

export function countStaleConsolidatedPayCheckouts(
  batches: Record<string, B2bConsolidatedPayBatch> | null | undefined,
  nowMs = Date.now(),
): number {
  if (!batches) return 0;
  let count = 0;
  for (const batch of Object.values(batches)) {
    if (!batch.checkoutStartedAt || batch.checkoutCompletedAt) continue;
    const startedMs = new Date(batch.checkoutStartedAt).getTime();
    if (!Number.isFinite(startedMs)) continue;
    if (nowMs - startedMs >= B2B_CONSOLIDATED_PAY_STALE_CHECKOUT_MS) count += 1;
  }
  return count;
}

export function patchConsolidatedPayBatchCheckoutStarted(
  batch: B2bConsolidatedPayBatch,
  startedAt: string,
): B2bConsolidatedPayBatch {
  return { ...batch, checkoutStartedAt: startedAt };
}

export function patchConsolidatedPayBatchCheckoutCompleted(
  batch: B2bConsolidatedPayBatch,
  completedAt: string,
): B2bConsolidatedPayBatch {
  return { ...batch, checkoutCompletedAt: completedAt };
}
