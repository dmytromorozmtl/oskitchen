import { CustomerTimelineEventType, type Prisma } from "@prisma/client";

import {
  isShopifyMarketsB2bPaymentCollectionEnabled,
  resolveB2bInvoiceOverdueGraceDays,
} from "@/lib/commercial/shopify-market-b2b-payment-collection";
import {
  appendInvoiceDraftToB2bMetadata,
  incrementB2bPaymentCollectionStats,
  isB2bInvoiceDraftOpen,
  isB2bInvoiceOverdue,
  patchInvoiceDraftPayment,
  readB2bInvoiceDraftLink,
  type B2bInvoiceDraftLink,
} from "@/lib/integrations/shopify-b2b-invoice-draft-metadata";
import {
  readKitchenOrderB2bMetadata,
  type KitchenOrderB2bMetadata,
} from "@/lib/integrations/shopify-b2b-kitchen-order-metadata";
import {
  mergeShopifyMarketsSyncSettings,
  parseShopifyMarketsSyncSettings,
} from "@/lib/integrations/shopify-markets-settings";
import { prisma } from "@/lib/prisma";
import { orderListWhereForOwner } from "@/lib/scope/workspace-order-scope";
import { recordBillingEvent } from "@/services/billing/billing-service";

export type B2bInvoicePaymentResult =
  | { ok: true; draft: B2bInvoiceDraftLink; paymentStatus: "PAID" | "PARTIAL" }
  | { ok: false; reason: string; skipped?: boolean };

async function recordPaymentCollectionStats(input: {
  connectionId: string;
  patch: Parameters<typeof incrementB2bPaymentCollectionStats>[1];
  collectedAt: string;
}) {
  const conn = await prisma.integrationConnection.findUnique({
    where: { id: input.connectionId },
    select: { settingsJson: true },
  });
  if (!conn) return;

  const sync = parseShopifyMarketsSyncSettings(conn.settingsJson);
  const nextStats = incrementB2bPaymentCollectionStats(sync.b2bPaymentCollectionStats, input.patch);
  await prisma.integrationConnection.update({
    where: { id: input.connectionId },
    data: {
      settingsJson: mergeShopifyMarketsSyncSettings(conn.settingsJson, {
        b2bPaymentCollectionStats: nextStats,
        lastB2bPaymentCollectedAt: input.collectedAt,
      }) as Prisma.InputJsonValue,
    },
  });
}

function readConnectionIdFromOrder(order: {
  channelTraceJson: unknown;
  sourceMetadataJson: unknown;
}): string | null {
  if (order.channelTraceJson && typeof order.channelTraceJson === "object") {
    const id = (order.channelTraceJson as Record<string, unknown>).connectionId;
    if (typeof id === "string" && id.trim()) return id;
  }
  return null;
}

export async function countOpenOverdueB2bInvoiceDraftsForOwner(
  userId: string,
  graceDays = 0,
): Promise<number> {
  const orders = await prisma.order.findMany({
    where: await orderListWhereForOwner(userId),
    select: { sourceMetadataJson: true, paymentStatus: true },
    take: 1000,
    orderBy: { createdAt: "desc" },
  });
  const nowMs = Date.now();
  let count = 0;
  for (const order of orders) {
    const draft = readB2bInvoiceDraftLink(order.sourceMetadataJson);
    if (!draft || !isB2bInvoiceDraftOpen(draft)) continue;
    const ps = (order.paymentStatus ?? "").toUpperCase();
    if (ps === "PAID") continue;
    if (isB2bInvoiceOverdue(draft, nowMs, graceDays)) count += 1;
  }
  return count;
}

export async function refreshB2bPaymentCollectionOverdueStats(input: {
  userId: string;
  connectionId: string;
}): Promise<number> {
  const conn = await prisma.integrationConnection.findUnique({
    where: { id: input.connectionId },
    select: { settingsJson: true },
  });
  if (!conn) return 0;

  const sync = parseShopifyMarketsSyncSettings(conn.settingsJson);
  const graceDays = resolveB2bInvoiceOverdueGraceDays(sync.b2bInvoiceOverdueGraceDays);
  const overdueOpen = await countOpenOverdueB2bInvoiceDraftsForOwner(input.userId, graceDays);
  const nextStats = incrementB2bPaymentCollectionStats(sync.b2bPaymentCollectionStats, {
    overdueOpen,
  });
  await prisma.integrationConnection.update({
    where: { id: input.connectionId },
    data: {
      settingsJson: mergeShopifyMarketsSyncSettings(conn.settingsJson, {
        b2bPaymentCollectionStats: nextStats,
      }) as Prisma.InputJsonValue,
    },
  });
  return overdueOpen;
}

export async function markB2bInvoiceDraftPaid(input: {
  userId: string;
  workspaceId: string | null;
  orderId: string;
  performedById: string;
  paidAmountCents?: number;
  paymentReference?: string | null;
}): Promise<B2bInvoicePaymentResult> {
  if (!isShopifyMarketsB2bPaymentCollectionEnabled()) {
    return { ok: false, reason: "payment_collection_disabled", skipped: true };
  }

  const order = await prisma.order.findFirst({
    where: { id: input.orderId, userId: input.userId },
    select: {
      id: true,
      total: true,
      paymentStatus: true,
      paymentMode: true,
      customerId: true,
      sourceMetadataJson: true,
      channelTraceJson: true,
    },
  });
  if (!order) return { ok: false, reason: "order_not_found" };

  const b2b = readKitchenOrderB2bMetadata(order.sourceMetadataJson);
  const draft = readB2bInvoiceDraftLink(order.sourceMetadataJson);
  const connectionId = readConnectionIdFromOrder(order);

  if (!draft) {
    if (connectionId) {
      await recordPaymentCollectionStats({
        connectionId,
        patch: { skippedNoDraft: 1 },
        collectedAt: new Date().toISOString(),
      });
    }
    return { ok: false, reason: "no_invoice_draft", skipped: true };
  }

  if (!isB2bInvoiceDraftOpen(draft)) {
    if (connectionId) {
      await recordPaymentCollectionStats({
        connectionId,
        patch: { skippedAlreadyPaid: 1 },
        collectedAt: new Date().toISOString(),
      });
    }
    return { ok: false, reason: "already_paid", skipped: true };
  }

  const ps = (order.paymentStatus ?? "").toUpperCase();
  if (ps === "PAID") {
    if (connectionId) {
      await recordPaymentCollectionStats({
        connectionId,
        patch: { skippedAlreadyPaid: 1 },
        collectedAt: new Date().toISOString(),
      });
    }
    return { ok: false, reason: "order_already_paid", skipped: true };
  }

  const paidAt = new Date().toISOString();
  const targetPaidCents =
    input.paidAmountCents != null && Number.isFinite(input.paidAmountCents)
      ? Math.round(input.paidAmountCents)
      : draft.amountCents;

  const nextDraft = patchInvoiceDraftPayment(draft, {
    paidAmountCents: targetPaidCents,
    paidAt,
    paymentReference: input.paymentReference ?? null,
    markedPaidById: input.performedById,
  });

  const paymentStatus = nextDraft.status === "paid" ? "PAID" : "PARTIAL";

  const root =
    order.sourceMetadataJson && typeof order.sourceMetadataJson === "object"
      ? { ...(order.sourceMetadataJson as Record<string, unknown>) }
      : {};
  const b2bBlock = (b2b ?? {}) as KitchenOrderB2bMetadata;
  root.b2b = appendInvoiceDraftToB2bMetadata(b2bBlock, nextDraft);

  await prisma.order.update({
    where: { id: order.id },
    data: {
      sourceMetadataJson: root as Prisma.InputJsonValue,
      paymentStatus,
      paymentMode: "MANUAL_INVOICE",
    },
  });

  if (order.customerId) {
    await prisma.customerTimelineEvent.create({
      data: {
        customerId: order.customerId,
        eventType: CustomerTimelineEventType.OTHER,
        sourceType: "order",
        sourceId: order.id,
        summary: `B2B invoice ${nextDraft.invoiceNumber} marked ${nextDraft.status}`,
        metadataJson: {
          invoiceId: nextDraft.invoiceId,
          invoiceNumber: nextDraft.invoiceNumber,
          paidAmountCents: nextDraft.paidAmountCents ?? targetPaidCents,
          paymentReference: nextDraft.paymentReference,
          paymentStatus,
        } as Prisma.InputJsonValue,
      },
    });
  }

  await recordBillingEvent({
    userId: input.userId,
    workspaceId: input.workspaceId,
    eventType: nextDraft.status === "paid" ? "B2B_INVOICE_MARKED_PAID" : "B2B_INVOICE_MARKED_PARTIAL",
    source: "internal",
    performedById: input.performedById,
    summary: `B2B invoice ${nextDraft.invoiceNumber} ${nextDraft.status} on order ${order.id.slice(0, 8)}`,
    metadata: {
      orderId: order.id,
      invoiceId: nextDraft.invoiceId,
      invoiceNumber: nextDraft.invoiceNumber,
      paidAmountCents: nextDraft.paidAmountCents,
      amountCents: nextDraft.amountCents,
      paymentReference: nextDraft.paymentReference,
      connectionId,
    },
  }).catch(() => undefined);

  if (connectionId) {
    await recordPaymentCollectionStats({
      connectionId,
      patch: {
        markedPaid: nextDraft.status === "paid" ? 1 : 0,
        markedPartial: nextDraft.status === "partial" ? 1 : 0,
      },
      collectedAt: paidAt,
    });
    await refreshB2bPaymentCollectionOverdueStats({
      userId: input.userId,
      connectionId,
    }).catch(() => undefined);
  }

  return { ok: true, draft: nextDraft, paymentStatus };
}
