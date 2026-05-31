import { IntegrationProvider, type Prisma } from "@prisma/client";

import {
  B2B_AR_DASHBOARD_BULK_MAX,
  isShopifyMarketsB2bArDashboardEnabled,
  resolveB2bArDashboardEnabled,
} from "@/lib/commercial/shopify-market-b2b-ar-dashboard";
import { resolveB2bInvoiceOverdueGraceDays } from "@/lib/commercial/shopify-market-b2b-payment-collection";
import {
  buildB2bArAgingRow,
  buildB2bArAgingSnapshot,
} from "@/lib/integrations/shopify-b2b-ar-aging-metadata";
import {
  buildB2bArAutoReminderSummary,
  buildB2bArCreditLimitRows,
} from "@/lib/integrations/shopify-b2b-credit-limit-metadata";
import {
  buildB2bArCompanyRollups,
  buildB2bArDashboardSnapshot,
  incrementB2bArDashboardStats,
  type B2bArDashboardRow,
  type B2bArDashboardSnapshot,
  type B2bArDashboardStats,
} from "@/lib/integrations/shopify-b2b-ar-dashboard-metadata";
import {
  isB2bShopifyPaymentDrift,
  readShopifyFinancialStatus,
} from "@/lib/integrations/shopify-b2b-financial-mirror-metadata";
import { readB2bInvoiceDraftLink } from "@/lib/integrations/shopify-b2b-invoice-draft-metadata";
import { readKitchenOrderB2bMetadata } from "@/lib/integrations/shopify-b2b-kitchen-order-metadata";
import {
  mergeShopifyMarketsSyncSettings,
  parseShopifyMarketsSyncSettings,
} from "@/lib/integrations/shopify-markets-settings";
import { prisma } from "@/lib/prisma";
import { decryptOrderPiiFields } from "@/lib/orders/order-pii";
import { orderListWhereForOwner } from "@/lib/scope/workspace-order-scope";
import { sendB2bInvoiceOverdueReminderForOrder } from "@/services/integrations/shopify-b2b-ar-aging-service";
import { ensureB2bInvoicePayPortalLink } from "@/services/integrations/shopify-b2b-invoice-pay-portal-service";
import { isShopifyMarketsB2bCollectorQueueEnabled } from "@/lib/commercial/shopify-market-b2b-collector-queue";
import { syncB2bCollectorQueueForConnection } from "@/services/integrations/shopify-b2b-collector-queue-service";

export type B2bArDashboardBulkResult = {
  processed: number;
  succeeded: number;
  skipped: number;
  errors: string[];
};

function readExternalOrderNumber(sourceMetadataJson: unknown): string | null {
  if (!sourceMetadataJson || typeof sourceMetadataJson !== "object") return null;
  const value = (sourceMetadataJson as Record<string, unknown>).externalOrderNumber;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function loadShopifyConnectionContext(userId: string) {
  const conn = await prisma.integrationConnection.findFirst({
    where: { userId, provider: IntegrationProvider.SHOPIFY },
    select: { id: true, settingsJson: true },
  });
  if (!conn) {
    return {
      connectionId: null as string | null,
      graceDays: 0,
      collectorsByCompanyId: {} as Record<string, string>,
      creditLimitsByCompanyId: {} as Record<string, { limitCents: number }>,
      dashboardEnabled: true,
      autoReminderInput: {
        reminderEnabled: true,
        autoDunningEnabled: false,
        operatorDigestEnabled: false,
        cadenceDays: null,
        lastRunAt: null,
        lastReminderAt: null,
        dunningStats: null,
      },
    };
  }
  const sync = parseShopifyMarketsSyncSettings(conn.settingsJson);
  return {
    connectionId: conn.id,
    graceDays: resolveB2bInvoiceOverdueGraceDays(sync.b2bInvoiceOverdueGraceDays),
    collectorsByCompanyId: sync.b2bArCollectorsByCompanyId ?? {},
    creditLimitsByCompanyId: sync.b2bCreditLimitsByCompanyId ?? {},
    dashboardEnabled: resolveB2bArDashboardEnabled(sync.b2bArDashboardEnabled),
    autoReminderInput: {
      reminderEnabled: sync.b2bArReminderEnabled,
      autoDunningEnabled: sync.b2bAutoDunningEnabled,
      operatorDigestEnabled: sync.b2bOperatorDigestEnabled,
      cadenceDays: sync.b2bDunningCadenceDays,
      lastRunAt: sync.lastB2bDunningRunAt,
      lastReminderAt: sync.lastB2bArReminderAt,
      dunningStats: sync.b2bDunningStats,
    },
  };
}

async function recordDashboardStats(input: {
  connectionId: string | null;
  patch: Partial<B2bArDashboardStats>;
  viewAt?: string;
  exportAt?: string;
}) {
  if (!input.connectionId) return;
  const conn = await prisma.integrationConnection.findUnique({
    where: { id: input.connectionId },
    select: { settingsJson: true },
  });
  if (!conn) return;

  const sync = parseShopifyMarketsSyncSettings(conn.settingsJson);
  const nextStats = incrementB2bArDashboardStats(sync.b2bArDashboardStats, input.patch);
  await prisma.integrationConnection.update({
    where: { id: input.connectionId },
    data: {
      settingsJson: mergeShopifyMarketsSyncSettings(conn.settingsJson, {
        b2bArDashboardStats: nextStats,
        ...(input.viewAt ? { lastB2bArDashboardViewAt: input.viewAt } : {}),
        ...(input.exportAt ? { lastB2bArDashboardExportAt: input.exportAt } : {}),
      }) as Prisma.InputJsonValue,
    },
  });
}

async function persistHealthScore(connectionId: string | null, score: number) {
  if (!connectionId) return;
  const conn = await prisma.integrationConnection.findUnique({
    where: { id: connectionId },
    select: { settingsJson: true },
  });
  if (!conn) return;
  await prisma.integrationConnection.update({
    where: { id: connectionId },
    data: {
      settingsJson: mergeShopifyMarketsSyncSettings(conn.settingsJson, {
        b2bArHealthScore: score,
      }) as Prisma.InputJsonValue,
    },
  });
}

function enrichDashboardRow(input: {
  row: NonNullable<ReturnType<typeof buildB2bArAgingRow>>;
  order: {
    paymentStatus: string | null;
    sourceMetadataJson: unknown;
  };
  collectorsByCompanyId: Record<string, string>;
}): B2bArDashboardRow {
  const b2b = readKitchenOrderB2bMetadata(input.order.sourceMetadataJson);
  const draft = readB2bInvoiceDraftLink(input.order.sourceMetadataJson);
  const companyAccountId = b2b?.companyAccountId ?? null;
  const assignedCollector =
    companyAccountId && input.collectorsByCompanyId[companyAccountId]
      ? input.collectorsByCompanyId[companyAccountId]
      : null;
  const shopifyFinancialStatus = readShopifyFinancialStatus(input.order.sourceMetadataJson);

  return {
    ...input.row,
    companyAccountId,
    osMarketId: b2b?.osMarketId ?? null,
    externalOrderNumber: readExternalOrderNumber(input.order.sourceMetadataJson),
    kitchenPaymentStatus: input.order.paymentStatus,
    shopifyFinancialStatus,
    paymentStatusDrift: isB2bShopifyPaymentDrift(
      input.order.paymentStatus,
      shopifyFinancialStatus,
    ),
    payPortalIssued: Boolean(draft?.payPortalIssuedAt),
    payPortalCheckoutStarted: Boolean(draft?.payPortalCheckoutStartedAt),
    collectionPriority:
      input.row.bucket === "days_61_plus"
        ? "critical"
        : input.row.bucket === "days_31_60"
          ? "high"
          : input.row.bucket === "days_0_30"
            ? "medium"
            : "low",
    assignedCollector,
  };
}

export async function buildB2bArDashboardSnapshotForOwner(input: {
  userId: string;
  recordView?: boolean;
}): Promise<B2bArDashboardSnapshot | null> {
  if (!isShopifyMarketsB2bArDashboardEnabled()) return null;

  const ctx = await loadShopifyConnectionContext(input.userId);
  if (!ctx.dashboardEnabled) return null;

  const orders = await prisma.order.findMany({
    where: await orderListWhereForOwner(input.userId),
    select: {
      id: true,
      customerEmail: true,
      customerName: true,
      paymentStatus: true,
      sourceMetadataJson: true,
    },
    take: 1000,
    orderBy: { createdAt: "desc" },
  });

  const nowMs = Date.now();
  const dashboardRows: B2bArDashboardRow[] = [];

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
      graceDays: ctx.graceDays,
    });
    if (!row) continue;

    dashboardRows.push(
      enrichDashboardRow({
        row,
        order,
        collectorsByCompanyId: ctx.collectorsByCompanyId,
      }),
    );
  }

  const aging = buildB2bArAgingSnapshot(dashboardRows);

  let collectorQueue = null;
  const companies = buildB2bArCompanyRollups(dashboardRows, ctx.collectorsByCompanyId);
  if (isShopifyMarketsB2bCollectorQueueEnabled() && ctx.connectionId) {
    collectorQueue = await syncB2bCollectorQueueForConnection({
      connectionId: ctx.connectionId,
      companies,
      rows: dashboardRows,
      collectorsByCompanyId: ctx.collectorsByCompanyId,
    });
  }

  const creditLimits = buildB2bArCreditLimitRows(companies, ctx.creditLimitsByCompanyId);
  const autoReminderSummary = buildB2bArAutoReminderSummary(ctx.autoReminderInput);

  const snapshot = buildB2bArDashboardSnapshot({
    aging,
    rows: dashboardRows,
    collectorsByCompanyId: ctx.collectorsByCompanyId,
    collectorQueue,
    creditLimits,
    autoReminderSummary,
  });

  await persistHealthScore(ctx.connectionId, snapshot.healthScore);

  if (input.recordView) {
    await recordDashboardStats({
      connectionId: ctx.connectionId,
      patch: { views: 1 },
      viewAt: new Date().toISOString(),
    });
  }

  return snapshot;
}

export async function bulkSendB2bArReminders(input: {
  userId: string;
  workspaceId: string | null;
  performedById: string;
  orderIds: string[];
}): Promise<B2bArDashboardBulkResult> {
  const unique = [...new Set(input.orderIds)].slice(0, B2B_AR_DASHBOARD_BULK_MAX);
  const result: B2bArDashboardBulkResult = {
    processed: 0,
    succeeded: 0,
    skipped: 0,
    errors: [],
  };

  for (const orderId of unique) {
    result.processed += 1;
    const reminder = await sendB2bInvoiceOverdueReminderForOrder({
      userId: input.userId,
      workspaceId: input.workspaceId,
      orderId,
      performedById: input.performedById,
      source: "manual",
    });
    if (reminder.ok) {
      result.succeeded += 1;
    } else {
      result.skipped += 1;
      if (result.errors.length < 5) {
        result.errors.push(`${orderId.slice(0, 8)}: ${reminder.reason}`);
      }
    }
  }

  const ctx = await loadShopifyConnectionContext(input.userId);
  if (result.succeeded > 0) {
    await recordDashboardStats({
      connectionId: ctx.connectionId,
      patch: { bulkRemindersSent: result.succeeded },
    });
  }

  return result;
}

export async function bulkMintB2bArPayLinks(input: {
  userId: string;
  orderIds: string[];
}): Promise<B2bArDashboardBulkResult & { urls: Array<{ orderId: string; url: string }> }> {
  const unique = [...new Set(input.orderIds)].slice(0, B2B_AR_DASHBOARD_BULK_MAX);
  const result: B2bArDashboardBulkResult & { urls: Array<{ orderId: string; url: string }> } = {
    processed: 0,
    succeeded: 0,
    skipped: 0,
    errors: [],
    urls: [],
  };

  const ctx = await loadShopifyConnectionContext(input.userId);

  for (const orderId of unique) {
    result.processed += 1;
    const link = await ensureB2bInvoicePayPortalLink({
      userId: input.userId,
      orderId,
      connectionId: ctx.connectionId,
    });
    if (link.ok) {
      result.succeeded += 1;
      result.urls.push({ orderId, url: link.url });
    } else {
      result.skipped += 1;
      if (result.errors.length < 5) {
        result.errors.push(`${orderId.slice(0, 8)}: ${link.reason}`);
      }
    }
  }

  if (result.succeeded > 0) {
    await recordDashboardStats({
      connectionId: ctx.connectionId,
      patch: { bulkPayLinksMinted: result.succeeded },
    });
  }

  return result;
}

export async function assignB2bArCollectorForCompany(input: {
  userId: string;
  companyAccountId: string;
  collectorLabel: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const conn = await prisma.integrationConnection.findFirst({
    where: { userId: input.userId, provider: IntegrationProvider.SHOPIFY },
    select: { id: true, settingsJson: true },
  });
  if (!conn) return { ok: false, reason: "no_shopify_connection" };

  const sync = parseShopifyMarketsSyncSettings(conn.settingsJson);
  const nextCollectors = { ...(sync.b2bArCollectorsByCompanyId ?? {}) };
  const label = input.collectorLabel.trim();
  if (!label) {
    delete nextCollectors[input.companyAccountId];
  } else {
    nextCollectors[input.companyAccountId] = label;
  }

  await prisma.integrationConnection.update({
    where: { id: conn.id },
    data: {
      settingsJson: mergeShopifyMarketsSyncSettings(conn.settingsJson, {
        b2bArCollectorsByCompanyId: nextCollectors,
      }) as Prisma.InputJsonValue,
    },
  });

  await recordDashboardStats({
    connectionId: conn.id,
    patch: { collectorsAssigned: 1 },
  });

  return { ok: true };
}

export async function setB2bArCreditLimitForCompany(input: {
  userId: string;
  companyAccountId: string;
  limitDollars: number | null;
  notes?: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const conn = await prisma.integrationConnection.findFirst({
    where: { userId: input.userId, provider: IntegrationProvider.SHOPIFY },
    select: { id: true, settingsJson: true },
  });
  if (!conn) return { ok: false, reason: "no_shopify_connection" };

  const sync = parseShopifyMarketsSyncSettings(conn.settingsJson);
  const nextLimits = { ...(sync.b2bCreditLimitsByCompanyId ?? {}) };

  if (input.limitDollars == null || input.limitDollars <= 0) {
    delete nextLimits[input.companyAccountId];
  } else {
    nextLimits[input.companyAccountId] = {
      limitCents: Math.round(input.limitDollars * 100),
      ...(input.notes?.trim() ? { notes: input.notes.trim() } : {}),
      updatedAt: new Date().toISOString(),
    };
  }

  await prisma.integrationConnection.update({
    where: { id: conn.id },
    data: {
      settingsJson: mergeShopifyMarketsSyncSettings(conn.settingsJson, {
        b2bCreditLimitsByCompanyId: nextLimits,
      }) as Prisma.InputJsonValue,
    },
  });

  return { ok: true };
}

export async function recordB2bArDashboardCsvExport(userId: string): Promise<void> {
  const ctx = await loadShopifyConnectionContext(userId);
  await recordDashboardStats({
    connectionId: ctx.connectionId,
    patch: { csvExports: 1 },
    exportAt: new Date().toISOString(),
  });
}

export async function resolveB2bArHealthScoreForOwner(userId: string): Promise<number | null> {
  const snapshot = await buildB2bArDashboardSnapshotForOwner({ userId, recordView: false });
  return snapshot?.healthScore ?? null;
}
