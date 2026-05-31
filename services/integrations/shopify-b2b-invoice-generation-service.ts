import { IntegrationProvider, type Prisma } from "@prisma/client";

import {
  isShopifyMarketsB2bInvoiceEnabled,
  resolveB2bAutoGenerateInvoice,
} from "@/lib/commercial/shopify-market-b2b-invoice";
import {
  appendInvoiceDraftToB2bMetadata,
  buildB2bInvoiceNumber,
  computeB2bInvoiceDueAt,
  incrementB2bInvoiceStats,
  readB2bInvoiceDraftLink,
  type B2bInvoiceDraftLink,
} from "@/lib/integrations/shopify-b2b-invoice-draft-metadata";
import type { KitchenOrderB2bMetadata } from "@/lib/integrations/shopify-b2b-kitchen-order-metadata";
import {
  mergeShopifyMarketsSyncSettings,
  parseShopifyMarketsSyncSettings,
} from "@/lib/integrations/shopify-markets-settings";
import { prisma } from "@/lib/prisma";
import { recordBillingEvent } from "@/services/billing/billing-service";

export type B2bInvoiceGenerationResult =
  | { ok: true; linked: B2bInvoiceDraftLink }
  | { ok: false; reason: string; skipped?: boolean };

async function recordInvoiceStats(input: {
  connectionId: string;
  patch: Parameters<typeof incrementB2bInvoiceStats>[1];
  generatedAt: string;
}) {
  const conn = await prisma.integrationConnection.findUnique({
    where: { id: input.connectionId },
    select: { settingsJson: true },
  });
  if (!conn) return;

  const sync = parseShopifyMarketsSyncSettings(conn.settingsJson);
  const nextStats = incrementB2bInvoiceStats(sync.b2bInvoiceStats, input.patch);
  await prisma.integrationConnection.update({
    where: { id: input.connectionId },
    data: {
      settingsJson: mergeShopifyMarketsSyncSettings(conn.settingsJson, {
        b2bInvoiceStats: nextStats,
        lastB2bInvoiceGeneratedAt: input.generatedAt,
      }) as Prisma.InputJsonValue,
    },
  });
}

async function patchOrderInvoiceDraft(input: {
  orderId: string;
  sourceMetadataJson: unknown;
  b2b: KitchenOrderB2bMetadata;
  link: B2bInvoiceDraftLink;
}) {
  const root =
    input.sourceMetadataJson && typeof input.sourceMetadataJson === "object"
      ? { ...(input.sourceMetadataJson as Record<string, unknown>) }
      : {};
  root.b2b = appendInvoiceDraftToB2bMetadata(input.b2b, input.link);
  await prisma.order.update({
    where: { id: input.orderId },
    data: {
      sourceMetadataJson: root as Prisma.InputJsonValue,
      paymentMode: "MANUAL_INVOICE",
      paymentStatus: "UNPAID",
    },
  });
}

export async function maybeGenerateB2bInvoiceDraft(input: {
  userId: string;
  workspaceId: string | null;
  orderId: string;
  provider: IntegrationProvider;
  connectionId: string | null;
  orderTotal: number;
  currency?: string;
  b2b: KitchenOrderB2bMetadata;
  sourceMetadataJson: unknown;
}): Promise<B2bInvoiceGenerationResult> {
  if (!isShopifyMarketsB2bInvoiceEnabled()) {
    return { ok: false, reason: "invoice_disabled", skipped: true };
  }
  if (input.provider !== IntegrationProvider.SHOPIFY) {
    return { ok: false, reason: "not_shopify", skipped: true };
  }
  if (!input.b2b.paymentTerms) {
    if (input.connectionId) {
      await recordInvoiceStats({
        connectionId: input.connectionId,
        patch: { skippedNoTerms: 1 },
        generatedAt: new Date().toISOString(),
      });
    }
    return { ok: false, reason: "no_net_terms", skipped: true };
  }
  if (input.b2b.status !== "complete") {
    if (input.connectionId) {
      await recordInvoiceStats({
        connectionId: input.connectionId,
        patch: { skippedIncomplete: 1 },
        generatedAt: new Date().toISOString(),
      });
    }
    return { ok: false, reason: "b2b_incomplete", skipped: true };
  }

  const existing = readB2bInvoiceDraftLink(input.sourceMetadataJson);
  if (existing) {
    if (input.connectionId) {
      await recordInvoiceStats({
        connectionId: input.connectionId,
        patch: { skippedAlreadyLinked: 1 },
        generatedAt: new Date().toISOString(),
      });
    }
    return { ok: false, reason: "already_linked", skipped: true };
  }

  let autoGenerate = true;
  let requirePo = false;
  if (input.connectionId) {
    const conn = await prisma.integrationConnection.findUnique({
      where: { id: input.connectionId },
      select: { settingsJson: true },
    });
    if (conn) {
      const sync = parseShopifyMarketsSyncSettings(conn.settingsJson);
      autoGenerate = resolveB2bAutoGenerateInvoice(sync.b2bAutoGenerateInvoice);
      requirePo = sync.b2bRequirePurchaseOrder;
    }
  }

  if (!autoGenerate) {
    if (input.connectionId) {
      await recordInvoiceStats({
        connectionId: input.connectionId,
        patch: { skippedDisabled: 1 },
        generatedAt: new Date().toISOString(),
      });
    }
    return { ok: false, reason: "auto_generate_disabled", skipped: true };
  }

  if (requirePo && input.b2b.missingPo) {
    if (input.connectionId) {
      await recordInvoiceStats({
        connectionId: input.connectionId,
        patch: { skippedMissingPo: 1 },
        generatedAt: new Date().toISOString(),
      });
    }
    return { ok: false, reason: "missing_po", skipped: true };
  }

  const generatedAt = new Date().toISOString();
  const amountCents = Math.round(Math.max(0, input.orderTotal) * 100);
  const currency = (input.currency ?? "usd").toLowerCase();
  const invoiceId = crypto.randomUUID();
  const invoiceNumber = buildB2bInvoiceNumber({ orderId: input.orderId, generatedAt });
  const dueAt = computeB2bInvoiceDueAt({
    anchorAt: input.b2b.promotedAt || generatedAt,
    paymentTerms: input.b2b.paymentTerms,
  });

  const link: B2bInvoiceDraftLink = {
    invoiceId,
    invoiceNumber,
    status: "draft",
    amountCents,
    currency,
    dueAt,
    generatedAt,
    paymentTermsLabel: input.b2b.paymentTerms?.label ?? null,
    poNumber: input.b2b.poNumber,
    companyName: input.b2b.companyName,
  };

  await patchOrderInvoiceDraft({
    orderId: input.orderId,
    sourceMetadataJson: input.sourceMetadataJson,
    b2b: input.b2b,
    link,
  });

  await recordBillingEvent({
    userId: input.userId,
    workspaceId: input.workspaceId,
    eventType: "B2B_INVOICE_DRAFT_CREATED",
    source: "internal",
    summary: `B2B invoice draft ${invoiceNumber} for order ${input.orderId.slice(0, 8)}`,
    metadata: {
      orderId: input.orderId,
      invoiceId,
      invoiceNumber,
      amountCents,
      currency,
      dueAt,
      companyName: input.b2b.companyName,
      poNumber: input.b2b.poNumber,
      paymentTermsLabel: input.b2b.paymentTerms?.label ?? null,
      connectionId: input.connectionId,
    },
  }).catch(() => undefined);

  if (input.connectionId) {
    await recordInvoiceStats({
      connectionId: input.connectionId,
      patch: { draftsCreated: 1 },
      generatedAt,
    });
  }

  return { ok: true, linked: link };
}

export async function applyB2bNetTermsPaymentMode(input: {
  orderId: string;
  b2b: KitchenOrderB2bMetadata | null;
}): Promise<void> {
  if (!input.b2b?.paymentTerms) return;
  await prisma.order.update({
    where: { id: input.orderId },
    data: {
      paymentMode: "MANUAL_INVOICE",
      paymentStatus: "UNPAID",
    },
  });
}
