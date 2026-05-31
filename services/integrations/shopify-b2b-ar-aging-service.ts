import { CustomerTimelineEventType, type Prisma } from "@prisma/client";

import {
  isShopifyMarketsB2bArAgingEnabled,
  resolveB2bArReminderEnabled,
} from "@/lib/commercial/shopify-market-b2b-ar-aging";
import { resolveB2bInvoiceOverdueGraceDays } from "@/lib/commercial/shopify-market-b2b-payment-collection";
import { sendB2bInvoiceOverdueReminder } from "@/lib/email";
import {
  buildB2bArAgingRow,
  buildB2bArAgingSnapshot,
  incrementB2bArAgingStats,
  patchInvoiceDraftReminderSent,
  snapshotToB2bArAgingStats,
  type B2bArAgingRow,
  type B2bArAgingSnapshot,
} from "@/lib/integrations/shopify-b2b-ar-aging-metadata";
import {
  appendInvoiceDraftToB2bMetadata,
  readB2bInvoiceDraftLink,
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
import { decryptOrderPiiFields } from "@/lib/orders/order-pii";
import { orderListWhereForOwner } from "@/lib/scope/workspace-order-scope";
import { formatCurrency } from "@/lib/utils";
import { recordBillingEvent } from "@/services/billing/billing-service";

export type B2bReminderResult =
  | { ok: true; sentAt: string; reminderCount: number }
  | { ok: false; reason: string; skipped?: boolean };

async function recordArAgingStats(input: {
  connectionId: string;
  patch: Parameters<typeof incrementB2bArAgingStats>[1];
  reminderAt?: string;
}) {
  const conn = await prisma.integrationConnection.findUnique({
    where: { id: input.connectionId },
    select: { settingsJson: true },
  });
  if (!conn) return;

  const sync = parseShopifyMarketsSyncSettings(conn.settingsJson);
  const nextStats = incrementB2bArAgingStats(sync.b2bArAgingStats, input.patch);
  await prisma.integrationConnection.update({
    where: { id: input.connectionId },
    data: {
      settingsJson: mergeShopifyMarketsSyncSettings(conn.settingsJson, {
        b2bArAgingStats: nextStats,
        ...(input.reminderAt ? { lastB2bArReminderAt: input.reminderAt } : {}),
      }) as Prisma.InputJsonValue,
    },
  });
}

function readConnectionIdFromOrder(order: { channelTraceJson: unknown }): string | null {
  if (order.channelTraceJson && typeof order.channelTraceJson === "object") {
    const id = (order.channelTraceJson as Record<string, unknown>).connectionId;
    if (typeof id === "string" && id.trim()) return id;
  }
  return null;
}

export async function buildB2bArAgingSnapshotForOwner(input: {
  userId: string;
  graceDays?: number;
  limit?: number;
}): Promise<B2bArAgingSnapshot> {
  if (!isShopifyMarketsB2bArAgingEnabled()) {
    return buildB2bArAgingSnapshot([], new Date().toISOString());
  }

  const orders = await prisma.order.findMany({
    where: await orderListWhereForOwner(input.userId),
    select: {
      id: true,
      customerEmail: true,
      customerName: true,
      paymentStatus: true,
      sourceMetadataJson: true,
    },
    take: input.limit ?? 1000,
    orderBy: { createdAt: "desc" },
  });

  const nowMs = Date.now();
  const graceDays = input.graceDays ?? 0;
  const rows: B2bArAgingRow[] = [];

  for (const order of orders) {
    const ps = (order.paymentStatus ?? "").toUpperCase();
    if (ps === "PAID") continue;

    const draft = readB2bInvoiceDraftLink(order.sourceMetadataJson);
    if (!draft) continue;

    const pii = decryptOrderPiiFields({
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: null,
    });

    const row = buildB2bArAgingRow({
      orderId: order.id,
      customerEmail: pii.customerEmail,
      customerName: pii.customerName,
      draft,
      nowMs,
      graceDays,
    });
    if (row) rows.push(row);
  }

  return buildB2bArAgingSnapshot(rows);
}

export async function refreshB2bArAgingStatsForConnection(input: {
  userId: string;
  connectionId: string;
}): Promise<B2bArAgingSnapshot> {
  const conn = await prisma.integrationConnection.findUnique({
    where: { id: input.connectionId },
    select: { settingsJson: true },
  });
  if (!conn) return buildB2bArAgingSnapshot([]);

  const sync = parseShopifyMarketsSyncSettings(conn.settingsJson);
  const graceDays = resolveB2bInvoiceOverdueGraceDays(sync.b2bInvoiceOverdueGraceDays);
  const snapshot = await buildB2bArAgingSnapshotForOwner({
    userId: input.userId,
    graceDays,
  });

  const baseStats = snapshotToB2bArAgingStats(snapshot);
  const nextStats = incrementB2bArAgingStats(sync.b2bArAgingStats, {
    lastSnapshotOpen: baseStats.lastSnapshotOpen,
    bucket0_30: baseStats.bucket0_30,
    bucket31_60: baseStats.bucket31_60,
    bucket61Plus: baseStats.bucket61Plus,
  });

  await prisma.integrationConnection.update({
    where: { id: input.connectionId },
    data: {
      settingsJson: mergeShopifyMarketsSyncSettings(conn.settingsJson, {
        b2bArAgingStats: nextStats,
      }) as Prisma.InputJsonValue,
    },
  });

  return snapshot;
}

export async function listB2bArAgingRowsForCustomer(input: {
  userId: string;
  customerEmail: string;
  graceDays?: number;
}): Promise<B2bArAgingRow[]> {
  const snapshot = await buildB2bArAgingSnapshotForOwner({
    userId: input.userId,
    graceDays: input.graceDays,
  });
  const email = input.customerEmail.trim().toLowerCase();
  return snapshot.rows.filter((row) => row.customerEmail?.trim().toLowerCase() === email);
}

export async function sendB2bInvoiceOverdueReminderForOrder(input: {
  userId: string;
  workspaceId: string | null;
  orderId: string;
  performedById?: string | null;
  source?: "manual" | "auto_dunning";
}): Promise<B2bReminderResult> {
  if (!isShopifyMarketsB2bArAgingEnabled()) {
    return { ok: false, reason: "ar_aging_disabled", skipped: true };
  }

  const order = await prisma.order.findFirst({
    where: { id: input.orderId, userId: input.userId },
    select: {
      id: true,
      customerId: true,
      customerEmail: true,
      customerName: true,
      paymentStatus: true,
      sourceMetadataJson: true,
      channelTraceJson: true,
    },
  });
  if (!order) return { ok: false, reason: "order_not_found" };

  const draft = readB2bInvoiceDraftLink(order.sourceMetadataJson);
  const b2b = readKitchenOrderB2bMetadata(order.sourceMetadataJson);
  const connectionId = readConnectionIdFromOrder(order);

  if (!draft) {
    if (connectionId) {
      await recordArAgingStats({
        connectionId,
        patch: { remindersSkipped: 1 },
      });
    }
    return { ok: false, reason: "no_invoice_draft", skipped: true };
  }

  const ps = (order.paymentStatus ?? "").toUpperCase();
  if (ps === "PAID" || draft.status === "paid") {
    if (connectionId) {
      await recordArAgingStats({
        connectionId,
        patch: { remindersSkipped: 1 },
      });
    }
    return { ok: false, reason: "already_paid", skipped: true };
  }

  let reminderEnabled = true;
  let graceDays = 0;
  if (connectionId) {
    const conn = await prisma.integrationConnection.findUnique({
      where: { id: connectionId },
      select: { settingsJson: true },
    });
    if (conn) {
      const sync = parseShopifyMarketsSyncSettings(conn.settingsJson);
      reminderEnabled = resolveB2bArReminderEnabled(sync.b2bArReminderEnabled);
      graceDays = resolveB2bInvoiceOverdueGraceDays(sync.b2bInvoiceOverdueGraceDays);
    }
  }

  if (!reminderEnabled) {
    if (connectionId) {
      await recordArAgingStats({
        connectionId,
        patch: { remindersSkipped: 1 },
      });
    }
    return { ok: false, reason: "reminders_disabled", skipped: true };
  }

  const nowMs = Date.now();
  const agingRow = buildB2bArAgingRow({
    orderId: order.id,
    customerEmail: order.customerEmail,
    customerName: order.customerName,
    draft,
    nowMs,
    graceDays,
  });

  if (!agingRow || agingRow.bucket === "current") {
    if (connectionId) {
      await recordArAgingStats({
        connectionId,
        patch: { remindersSkipped: 1 },
      });
    }
    return { ok: false, reason: "not_overdue", skipped: true };
  }

  const pii = decryptOrderPiiFields({
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: null,
  });
  if (!pii.customerEmail?.trim()) {
    return { ok: false, reason: "missing_customer_email" };
  }

  const settings = await prisma.kitchenSettings.findUnique({
    where: { userId: input.userId },
    select: { businessName: true },
  });

  const openAmount = agingRow.openAmountCents / 100;
  const dueDate = draft.dueAt
    ? new Date(draft.dueAt).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "See invoice terms";

  const emailResult = await sendB2bInvoiceOverdueReminder({
    to: pii.customerEmail,
    customerName: pii.customerName || draft.companyName || "there",
    invoiceNumber: draft.invoiceNumber,
    amountDue: formatCurrency(openAmount),
    dueDate,
    daysPastDue: agingRow.daysPastDue,
    poNumber: draft.poNumber,
    companyName: draft.companyName,
    paymentTermsLabel: draft.paymentTermsLabel,
    businessName: settings?.businessName,
  });

  if ("skipped" in emailResult && emailResult.skipped) {
    return { ok: false, reason: "email_not_configured" };
  }

  const sentAt = new Date().toISOString();
  const nextDraft = patchInvoiceDraftReminderSent(draft, sentAt);
  const root =
    order.sourceMetadataJson && typeof order.sourceMetadataJson === "object"
      ? { ...(order.sourceMetadataJson as Record<string, unknown>) }
      : {};
  const b2bBlock = (b2b ?? {}) as KitchenOrderB2bMetadata;
  root.b2b = appendInvoiceDraftToB2bMetadata(b2bBlock, nextDraft);

  await prisma.order.update({
    where: { id: order.id },
    data: { sourceMetadataJson: root as Prisma.InputJsonValue },
  });

  if (order.customerId) {
    await prisma.customerTimelineEvent.create({
      data: {
        customerId: order.customerId,
        eventType: CustomerTimelineEventType.CONTACTED,
        sourceType: "order",
        sourceId: order.id,
        summary: `B2B invoice reminder sent — ${draft.invoiceNumber}${input.source === "auto_dunning" ? " (auto)" : ""}`,
        metadataJson: {
          invoiceId: draft.invoiceId,
          invoiceNumber: draft.invoiceNumber,
          daysPastDue: agingRow.daysPastDue,
          openAmountCents: agingRow.openAmountCents,
          source: input.source ?? "manual",
        } as Prisma.InputJsonValue,
      },
    });
  }

  await recordBillingEvent({
    userId: input.userId,
    workspaceId: input.workspaceId,
    eventType:
      input.source === "auto_dunning"
        ? "B2B_INVOICE_AUTO_DUNNING_SENT"
        : "B2B_INVOICE_REMINDER_SENT",
    source: "internal",
    performedById: input.performedById ?? undefined,
    summary: `B2B invoice reminder ${draft.invoiceNumber} (${agingRow.daysPastDue}d past due)`,
    metadata: {
      orderId: order.id,
      invoiceId: draft.invoiceId,
      invoiceNumber: draft.invoiceNumber,
      daysPastDue: agingRow.daysPastDue,
      bucket: agingRow.bucket,
      connectionId,
      source: input.source ?? "manual",
    },
  }).catch(() => undefined);

  if (connectionId) {
    await recordArAgingStats({
      connectionId,
      patch: { remindersSent: 1 },
      reminderAt: sentAt,
    });
  }

  return {
    ok: true,
    sentAt,
    reminderCount: nextDraft.reminderCount ?? 1,
  };
}
