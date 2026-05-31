import { IntegrationProvider, type Prisma } from "@prisma/client";

import {
  B2B_FINANCIAL_MIRROR_REFRESH_CAP,
  isShopifyMarketsB2bFinancialMirrorEnabled,
} from "@/lib/commercial/shopify-market-b2b-financial-mirror";
import { resolveB2bInvoiceOverdueGraceDays } from "@/lib/commercial/shopify-market-b2b-payment-collection";
import { buildB2bArAgingRow } from "@/lib/integrations/shopify-b2b-ar-aging-metadata";
import {
  incrementB2bFinancialMirrorStats,
  isB2bShopifyPaymentDrift,
  patchShopifyFinancialStatusInSourceMetadata,
} from "@/lib/integrations/shopify-b2b-financial-mirror-metadata";
import { readB2bInvoiceDraftLink } from "@/lib/integrations/shopify-b2b-invoice-draft-metadata";
import {
  mergeShopifyMarketsSyncSettings,
  parseShopifyMarketsSyncSettings,
} from "@/lib/integrations/shopify-markets-settings";
import { prisma } from "@/lib/prisma";
import { orderListWhereForOwner } from "@/lib/scope/workspace-order-scope";
import {
  fetchShopifyOrderFinancialStatuses,
  type ShopifyCredentials,
} from "@/services/integrations/shopify";

export type B2bFinancialMirrorRefreshResult =
  | {
      ok: true;
      refreshed: number;
      skipped: number;
      errors: number;
      driftCount: number;
      capped: boolean;
    }
  | { ok: false; error: string; unavailable?: boolean };

function readExternalOrderId(sourceMetadataJson: unknown): string | null {
  if (!sourceMetadataJson || typeof sourceMetadataJson !== "object") return null;
  const value = (sourceMetadataJson as Record<string, unknown>).externalOrderId;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function recordMirrorStats(input: {
  connectionId: string;
  patch: Parameters<typeof incrementB2bFinancialMirrorStats>[1];
  refreshAt?: string;
  refreshResult?: string;
}) {
  const conn = await prisma.integrationConnection.findUnique({
    where: { id: input.connectionId },
    select: { settingsJson: true },
  });
  if (!conn) return;

  const sync = parseShopifyMarketsSyncSettings(conn.settingsJson);
  const nextStats = incrementB2bFinancialMirrorStats(sync.b2bFinancialMirrorStats, input.patch);
  await prisma.integrationConnection.update({
    where: { id: input.connectionId },
    data: {
      settingsJson: mergeShopifyMarketsSyncSettings(conn.settingsJson, {
        b2bFinancialMirrorStats: nextStats,
        ...(input.refreshAt ? { lastB2bFinancialMirrorRefreshAt: input.refreshAt } : {}),
        ...(input.refreshResult ? { lastB2bFinancialMirrorRefreshResult: input.refreshResult } : {}),
      }) as Prisma.InputJsonValue,
    },
  });
}

export async function recordB2bFinancialMirrorCapturedAtPromote(connectionId: string | null): Promise<void> {
  if (!connectionId || !isShopifyMarketsB2bFinancialMirrorEnabled()) return;
  await recordMirrorStats({
    connectionId,
    patch: { capturedAtPromote: 1 },
  });
}

export async function refreshB2bShopifyFinancialMirrorForConnection(input: {
  userId: string;
  connectionId: string;
  creds: ShopifyCredentials;
  origin?: "manual" | "full_reconcile";
}): Promise<B2bFinancialMirrorRefreshResult> {
  if (!isShopifyMarketsB2bFinancialMirrorEnabled()) {
    return { ok: false, error: "disabled", unavailable: true };
  }

  const conn = await prisma.integrationConnection.findUnique({
    where: { id: input.connectionId },
    select: { settingsJson: true, provider: true },
  });
  if (!conn || conn.provider !== IntegrationProvider.SHOPIFY) {
    return { ok: false, error: "no_shopify_connection" };
  }

  const sync = parseShopifyMarketsSyncSettings(conn.settingsJson);
  const graceDays = resolveB2bInvoiceOverdueGraceDays(sync.b2bInvoiceOverdueGraceDays);
  const nowMs = Date.now();
  const now = new Date().toISOString();

  const orders = await prisma.order.findMany({
    where: await orderListWhereForOwner(input.userId),
    select: {
      id: true,
      paymentStatus: true,
      sourceMetadataJson: true,
    },
    take: 1000,
    orderBy: { createdAt: "desc" },
  });

  const candidates: Array<{
    orderId: string;
    externalOrderId: string;
    paymentStatus: string | null;
    sourceMetadataJson: unknown;
  }> = [];

  for (const order of orders) {
    const ps = (order.paymentStatus ?? "").toUpperCase();
    if (ps === "PAID") continue;

    const draft = readB2bInvoiceDraftLink(order.sourceMetadataJson);
    if (!draft) continue;

    const row = buildB2bArAgingRow({
      orderId: order.id,
      customerEmail: null,
      customerName: null,
      draft,
      nowMs,
      graceDays,
    });
    if (!row) continue;

    const externalOrderId = readExternalOrderId(order.sourceMetadataJson);
    if (!externalOrderId) continue;

    candidates.push({
      orderId: order.id,
      externalOrderId,
      paymentStatus: order.paymentStatus,
      sourceMetadataJson: order.sourceMetadataJson,
    });
  }

  const capped = candidates.length > B2B_FINANCIAL_MIRROR_REFRESH_CAP;
  const batch = candidates.slice(0, B2B_FINANCIAL_MIRROR_REFRESH_CAP);
  if (batch.length === 0) {
    await recordMirrorStats({
      connectionId: input.connectionId,
      patch: { refreshSkipped: 1, lastDriftCount: 0 },
      refreshAt: now,
      refreshResult: "no_open_invoices",
    });
    return { ok: true, refreshed: 0, skipped: 0, errors: 0, driftCount: 0, capped: false };
  }

  const orderGids = batch.map((row) => `gid://shopify/Order/${row.externalOrderId}`);

  let statuses: Map<string, string>;
  try {
    statuses = await fetchShopifyOrderFinancialStatuses(input.creds, orderGids);
  } catch (e) {
    const message = e instanceof Error ? e.message : "shopify_fetch_failed";
    await recordMirrorStats({
      connectionId: input.connectionId,
      patch: { refreshErrors: 1 },
      refreshAt: now,
      refreshResult: `failed (${message})`,
    });
    return { ok: false, error: message };
  }

  let refreshed = 0;
  let skipped = 0;
  let errors = 0;
  let driftCount = 0;

  for (const row of batch) {
    const gid = `gid://shopify/Order/${row.externalOrderId}`;
    const tail = row.externalOrderId;
    const status = statuses.get(gid) ?? statuses.get(tail);
    if (!status) {
      skipped += 1;
      continue;
    }

    try {
      const nextMetadata = patchShopifyFinancialStatusInSourceMetadata(
        row.sourceMetadataJson,
        status,
        now,
      );
      await prisma.order.update({
        where: { id: row.orderId },
        data: { sourceMetadataJson: nextMetadata as Prisma.InputJsonValue },
      });
      refreshed += 1;

      if (isB2bShopifyPaymentDrift(row.paymentStatus, status)) {
        driftCount += 1;
      }
    } catch {
      errors += 1;
    }
  }

  const resultSummary = `refreshed=${refreshed} drift=${driftCount}${capped ? " capped" : ""}`;
  await recordMirrorStats({
    connectionId: input.connectionId,
    patch: {
      refreshed,
      refreshSkipped: skipped,
      refreshErrors: errors,
      lastDriftCount: driftCount,
    },
    refreshAt: now,
    refreshResult: resultSummary,
  });

  return { ok: true, refreshed, skipped, errors, driftCount, capped };
}
