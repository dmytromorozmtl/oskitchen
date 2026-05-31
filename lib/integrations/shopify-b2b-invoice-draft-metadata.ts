import type { KitchenOrderB2bMetadata } from "@/lib/integrations/shopify-b2b-kitchen-order-metadata";
import type { B2bPaymentTermsSnapshot } from "@/lib/integrations/shopify-b2b-net-terms-extract";

export type B2bInvoiceDraftStatus = "draft";

export type B2bInvoiceDraftLink = {
  invoiceId: string;
  invoiceNumber: string;
  status: B2bInvoiceDraftStatus;
  amountCents: number;
  currency: string;
  dueAt: string | null;
  generatedAt: string;
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

function readB2bBlock(sourceMetadataJson: unknown): Record<string, unknown> | null {
  if (!sourceMetadataJson || typeof sourceMetadataJson !== "object") return null;
  const b2b = (sourceMetadataJson as Record<string, unknown>).b2b;
  if (!b2b || typeof b2b !== "object") return null;
  return b2b as Record<string, unknown>;
}
