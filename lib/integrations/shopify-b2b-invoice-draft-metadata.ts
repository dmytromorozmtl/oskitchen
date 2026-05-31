import type { KitchenOrderB2bMetadata } from "@/lib/integrations/shopify-b2b-kitchen-order-metadata";
import type { B2bPaymentTermsSnapshot } from "@/lib/integrations/shopify-b2b-net-terms-extract";

export type B2bInvoiceDraftStatus = "draft" | "partial" | "paid";

export type B2bInvoiceDraftLink = {
  invoiceId: string;
  invoiceNumber: string;
  status: B2bInvoiceDraftStatus;
  amountCents: number;
  paidAmountCents?: number;
  currency: string;
  dueAt: string | null;
  generatedAt: string;
  paidAt?: string | null;
  paymentReference?: string | null;
  markedPaidById?: string | null;
  paymentTermsLabel: string | null;
  poNumber: string | null;
  companyName: string | null;
};

export type B2bInvoiceStats = {
  draftsCreated: number;
  skippedNoTerms: number;
  skippedIncomplete: number;
  skippedAlreadyLinked: number;
  skippedMissingPo: number;
  skippedDisabled: number;
};

export type B2bPaymentCollectionStats = {
  markedPaid: number;
  markedPartial: number;
  skippedAlreadyPaid: number;
  skippedNoDraft: number;
  overdueOpen: number;
};

export function buildB2bInvoiceNumber(input: {
  orderId: string;
  generatedAt: string;
}): string {
  const ymd = input.generatedAt.slice(0, 10).replace(/-/g, "");
  const suffix = input.orderId.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `B2B-${ymd}-${suffix}`;
}

export function computeB2bInvoiceDueAt(input: {
  anchorAt: string;
  paymentTerms: B2bPaymentTermsSnapshot | null;
}): string | null {
  const dueInDays = input.paymentTerms?.dueInDays;
  if (dueInDays == null || !Number.isFinite(dueInDays)) return null;
  const due = new Date(input.anchorAt);
  due.setUTCDate(due.getUTCDate() + dueInDays);
  return due.toISOString();
}

export function readB2bInvoiceDraftLink(sourceMetadataJson: unknown): B2bInvoiceDraftLink | null {
  const b2b = readB2bBlock(sourceMetadataJson);
  if (!b2b) return null;
  const draft = b2b.invoiceDraft;
  if (!draft || typeof draft !== "object") return null;
  return draft as B2bInvoiceDraftLink;
}

export function appendInvoiceDraftToB2bMetadata(
  b2b: KitchenOrderB2bMetadata,
  link: B2bInvoiceDraftLink,
): KitchenOrderB2bMetadata & { invoiceDraft: B2bInvoiceDraftLink } {
  return {
    ...b2b,
    invoiceDraft: link,
  };
}

export function incrementB2bInvoiceStats(
  current: B2bInvoiceStats | null | undefined,
  patch: Partial<B2bInvoiceStats>,
): B2bInvoiceStats {
  const base: B2bInvoiceStats = current ?? {
    draftsCreated: 0,
    skippedNoTerms: 0,
    skippedIncomplete: 0,
    skippedAlreadyLinked: 0,
    skippedMissingPo: 0,
    skippedDisabled: 0,
  };
  return {
    draftsCreated: base.draftsCreated + (patch.draftsCreated ?? 0),
    skippedNoTerms: base.skippedNoTerms + (patch.skippedNoTerms ?? 0),
    skippedIncomplete: base.skippedIncomplete + (patch.skippedIncomplete ?? 0),
    skippedAlreadyLinked: base.skippedAlreadyLinked + (patch.skippedAlreadyLinked ?? 0),
    skippedMissingPo: base.skippedMissingPo + (patch.skippedMissingPo ?? 0),
    skippedDisabled: base.skippedDisabled + (patch.skippedDisabled ?? 0),
  };
}

export function incrementB2bPaymentCollectionStats(
  current: B2bPaymentCollectionStats | null | undefined,
  patch: Partial<B2bPaymentCollectionStats>,
): B2bPaymentCollectionStats {
  const base: B2bPaymentCollectionStats = current ?? {
    markedPaid: 0,
    markedPartial: 0,
    skippedAlreadyPaid: 0,
    skippedNoDraft: 0,
    overdueOpen: 0,
  };
  return {
    markedPaid: base.markedPaid + (patch.markedPaid ?? 0),
    markedPartial: base.markedPartial + (patch.markedPartial ?? 0),
    skippedAlreadyPaid: base.skippedAlreadyPaid + (patch.skippedAlreadyPaid ?? 0),
    skippedNoDraft: base.skippedNoDraft + (patch.skippedNoDraft ?? 0),
    overdueOpen: patch.overdueOpen ?? base.overdueOpen,
  };
}

export function isB2bInvoiceDraftOpen(draft: B2bInvoiceDraftLink): boolean {
  return draft.status === "draft" || draft.status === "partial";
}

export function isB2bInvoiceOverdue(
  draft: B2bInvoiceDraftLink,
  nowMs: number,
  graceDays = 0,
): boolean {
  if (!isB2bInvoiceDraftOpen(draft) || !draft.dueAt) return false;
  const dueMs = new Date(draft.dueAt).getTime();
  if (!Number.isFinite(dueMs)) return false;
  const graceMs = graceDays * 86400000;
  return nowMs > dueMs + graceMs;
}

export function patchInvoiceDraftPayment(
  draft: B2bInvoiceDraftLink,
  input: {
    paidAmountCents: number;
    paidAt: string;
    paymentReference?: string | null;
    markedPaidById?: string | null;
  },
): B2bInvoiceDraftLink {
  const paidAmountCents = Math.max(0, Math.min(input.paidAmountCents, draft.amountCents));
  const status: B2bInvoiceDraftStatus =
    paidAmountCents >= draft.amountCents ? "paid" : paidAmountCents > 0 ? "partial" : draft.status;
  return {
    ...draft,
    status,
    paidAmountCents,
    paidAt: input.paidAt,
    paymentReference: input.paymentReference ?? draft.paymentReference ?? null,
    markedPaidById: input.markedPaidById ?? draft.markedPaidById ?? null,
  };
}

function readB2bBlock(sourceMetadataJson: unknown): Record<string, unknown> | null {
  if (!sourceMetadataJson || typeof sourceMetadataJson !== "object") return null;
  const b2b = (sourceMetadataJson as Record<string, unknown>).b2b;
  if (!b2b || typeof b2b !== "object") return null;
  return b2b as Record<string, unknown>;
}
