import { IntegrationProvider, type Prisma } from "@prisma/client";

import {
  isShopifyMarketsB2bDunningEnabled,
  resolveB2bAutoDunningEnabled,
  resolveB2bDunningCadenceDays,
  resolveB2bOperatorDigestEnabled,
  shouldSendB2bOperatorDigest,
} from "@/lib/commercial/shopify-market-b2b-dunning";
import { resolveB2bInvoiceOverdueGraceDays } from "@/lib/commercial/shopify-market-b2b-payment-collection";
import { isEmailConfigured, sendB2bArOperatorDigest } from "@/lib/email";
import { SITE_URL } from "@/lib/constants";
import {
  buildB2bOperatorDigestPreview,
  incrementB2bDunningStats,
  resolveB2bAutoDunningTier,
  type B2bDunningStats,
  type B2bOperatorDigestPreview,
} from "@/lib/integrations/shopify-b2b-dunning-metadata";
import {
  mergeShopifyMarketsSyncSettings,
  parseShopifyMarketsSyncSettings,
} from "@/lib/integrations/shopify-markets-settings";
import { prisma } from "@/lib/prisma";
import { recordBillingEvent } from "@/services/billing/billing-service";
import {
  buildB2bArAgingSnapshotForOwner,
  refreshB2bArAgingStatsForConnection,
  sendB2bInvoiceOverdueReminderForOrder,
} from "@/services/integrations/shopify-b2b-ar-aging-service";

export type B2bDunningRunResult = {
  connectionId: string;
  userId: string;
  digestSent: boolean;
  autoRemindersSent: number;
  skippedReason?: string;
};

export type B2bDunningCronSummary = {
  processed: number;
  digestsSent: number;
  autoRemindersSent: number;
  skippedEmailOff: number;
  skippedDisabled: number;
};

async function recordDunningStats(input: {
  connectionId: string;
  patch: Partial<B2bDunningStats>;
  runAt: string;
  digestAt?: string;
}) {
  const conn = await prisma.integrationConnection.findUnique({
    where: { id: input.connectionId },
    select: { settingsJson: true },
  });
  if (!conn) return;

  const sync = parseShopifyMarketsSyncSettings(conn.settingsJson);
  const nextStats = incrementB2bDunningStats(sync.b2bDunningStats, {
    runs: 1,
    ...input.patch,
  });
  await prisma.integrationConnection.update({
    where: { id: input.connectionId },
    data: {
      settingsJson: mergeShopifyMarketsSyncSettings(conn.settingsJson, {
        b2bDunningStats: nextStats,
        lastB2bDunningRunAt: input.runAt,
        ...(input.digestAt ? { lastB2bOperatorDigestAt: input.digestAt } : {}),
      }) as Prisma.InputJsonValue,
    },
  });
}

async function resolveOwnerEmail(userId: string): Promise<string | null> {
  const profile = await prisma.userProfile.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  return profile?.email?.trim() || null;
}

export async function buildB2bOperatorDigestPreviewForConnection(input: {
  userId: string;
  connectionId: string;
}): Promise<B2bOperatorDigestPreview | null> {
  if (!isShopifyMarketsB2bDunningEnabled()) return null;

  const conn = await prisma.integrationConnection.findUnique({
    where: { id: input.connectionId },
    select: { settingsJson: true },
  });
  if (!conn) return null;

  const sync = parseShopifyMarketsSyncSettings(conn.settingsJson);
  const graceDays = resolveB2bInvoiceOverdueGraceDays(sync.b2bInvoiceOverdueGraceDays);
  const snapshot = await buildB2bArAgingSnapshotForOwner({
    userId: input.userId,
    graceDays,
  });

  return buildB2bOperatorDigestPreview({
    snapshot,
    cadenceDays: resolveB2bDunningCadenceDays(sync.b2bDunningCadenceDays),
    autoDunningEnabled: resolveB2bAutoDunningEnabled(sync.b2bAutoDunningEnabled),
    operatorDigestEnabled: resolveB2bOperatorDigestEnabled(sync.b2bOperatorDigestEnabled),
    lastDigestAt: sync.lastB2bOperatorDigestAt,
    lastRunAt: sync.lastB2bDunningRunAt,
  });
}

export async function runB2bDunningForConnection(input: {
  userId: string;
  workspaceId: string | null;
  connectionId: string;
  forceDigest?: boolean;
}): Promise<B2bDunningRunResult> {
  const runAt = new Date().toISOString();

  if (!isShopifyMarketsB2bDunningEnabled()) {
    return {
      connectionId: input.connectionId,
      userId: input.userId,
      digestSent: false,
      autoRemindersSent: 0,
      skippedReason: "dunning_disabled",
    };
  }

  const conn = await prisma.integrationConnection.findUnique({
    where: { id: input.connectionId },
    select: { settingsJson: true, accessTokenEncrypted: true },
  });
  if (!conn?.accessTokenEncrypted) {
    return {
      connectionId: input.connectionId,
      userId: input.userId,
      digestSent: false,
      autoRemindersSent: 0,
      skippedReason: "no_credentials",
    };
  }

  const sync = parseShopifyMarketsSyncSettings(conn.settingsJson);
  const autoDunning = resolveB2bAutoDunningEnabled(sync.b2bAutoDunningEnabled);
  const operatorDigest = resolveB2bOperatorDigestEnabled(sync.b2bOperatorDigestEnabled);

  if (!autoDunning && !operatorDigest) {
    await recordDunningStats({
      connectionId: input.connectionId,
      patch: { skippedDisabled: 1 },
      runAt,
    });
    return {
      connectionId: input.connectionId,
      userId: input.userId,
      digestSent: false,
      autoRemindersSent: 0,
      skippedReason: "features_disabled",
    };
  }

  const graceDays = resolveB2bInvoiceOverdueGraceDays(sync.b2bInvoiceOverdueGraceDays);
  const cadenceDays = resolveB2bDunningCadenceDays(sync.b2bDunningCadenceDays);
  const snapshot = await refreshB2bArAgingStatsForConnection({
    userId: input.userId,
    connectionId: input.connectionId,
  });

  if (snapshot.openTotal === 0) {
    await recordDunningStats({
      connectionId: input.connectionId,
      patch: { skippedNoOpenInvoices: 1 },
      runAt,
    });
    return {
      connectionId: input.connectionId,
      userId: input.userId,
      digestSent: false,
      autoRemindersSent: 0,
      skippedReason: "no_open_invoices",
    };
  }

  let digestSent = false;
  let autoRemindersSent = 0;
  const statsPatch: Partial<B2bDunningStats> = {};
  let digestAt: string | undefined;

  const emailReady = isEmailConfigured();
  if (!emailReady) {
    statsPatch.skippedEmailOff = 1;
  }

  if (operatorDigest && emailReady) {
    const digestDue =
      input.forceDigest === true || shouldSendB2bOperatorDigest(sync.lastB2bOperatorDigestAt);
    if (digestDue) {
      const ownerEmail = await resolveOwnerEmail(input.userId);
      const kitchen = await prisma.kitchenSettings.findUnique({
        where: { userId: input.userId },
        select: { businessName: true },
      });
      if (ownerEmail) {
        const overdueRows = snapshot.rows.filter((row) => row.bucket !== "current");
        const result = await sendB2bArOperatorDigest({
          to: ownerEmail,
          businessName: kitchen?.businessName,
          openTotal: snapshot.openTotal,
          openAmountCents: snapshot.openAmountCents,
          overdueTotal: snapshot.overdueTotal,
          bucket0_30: snapshot.buckets.days_0_30,
          bucket31_60: snapshot.buckets.days_31_60,
          bucket61Plus: snapshot.buckets.days_61_plus,
          topOverdue: overdueRows.slice(0, 8).map((row) => ({
            invoiceNumber: row.invoiceNumber,
            companyName: row.companyName,
            daysPastDue: row.daysPastDue,
            openAmountCents: row.openAmountCents,
          })),
          orderHubUrl: `${SITE_URL}/dashboard/order-hub`,
        });
        if ("sent" in result && result.sent) {
          digestSent = true;
          digestAt = runAt;
          statsPatch.digestsSent = 1;
          await recordBillingEvent({
            userId: input.userId,
            workspaceId: input.workspaceId,
            eventType: "B2B_AR_OPERATOR_DIGEST_SENT",
            source: "internal",
            summary: `B2B AR digest — ${snapshot.openTotal} open, ${snapshot.overdueTotal} overdue`,
            metadata: {
              connectionId: input.connectionId,
              openTotal: snapshot.openTotal,
              overdueTotal: snapshot.overdueTotal,
              bucket61Plus: snapshot.buckets.days_61_plus,
            },
          }).catch(() => undefined);
        }
      }
    } else {
      statsPatch.skippedRecentDigest = 1;
    }
  }

  if (autoDunning && emailReady && sync.b2bArReminderEnabled !== false) {
    const overdueRows = snapshot.rows.filter((row) => row.bucket !== "current");
    for (const row of overdueRows) {
      const tier = resolveB2bAutoDunningTier({
        daysPastDue: row.daysPastDue,
        reminderCount: row.reminderCount,
        cadenceDays,
      });
      if (tier == null) continue;

      const reminder = await sendB2bInvoiceOverdueReminderForOrder({
        userId: input.userId,
        workspaceId: input.workspaceId,
        orderId: row.orderId,
        performedById: null,
        source: "auto_dunning",
      });
      if (reminder.ok) {
        autoRemindersSent += 1;
      }
    }
    if (autoRemindersSent > 0) {
      statsPatch.autoRemindersSent = autoRemindersSent;
    }
  }

  await recordDunningStats({
    connectionId: input.connectionId,
    patch: statsPatch,
    runAt,
    digestAt,
  });

  return {
    connectionId: input.connectionId,
    userId: input.userId,
    digestSent,
    autoRemindersSent,
  };
}

export async function runB2bDunningCronForAllConnections(): Promise<B2bDunningCronSummary> {
  if (!isShopifyMarketsB2bDunningEnabled()) {
    return {
      processed: 0,
      digestsSent: 0,
      autoRemindersSent: 0,
      skippedEmailOff: 0,
      skippedDisabled: 0,
    };
  }

  const connections = await prisma.integrationConnection.findMany({
    where: {
      provider: IntegrationProvider.SHOPIFY,
      accessTokenEncrypted: { not: null },
    },
    select: {
      id: true,
      userId: true,
      workspaceId: true,
    },
    take: 200,
  });

  const summary: B2bDunningCronSummary = {
    processed: 0,
    digestsSent: 0,
    autoRemindersSent: 0,
    skippedEmailOff: 0,
    skippedDisabled: 0,
  };

  for (const conn of connections) {
    const result = await runB2bDunningForConnection({
      userId: conn.userId,
      workspaceId: conn.workspaceId,
      connectionId: conn.id,
    }).catch(() => null);

    summary.processed += 1;
    if (!result) continue;
    if (result.skippedReason === "features_disabled") summary.skippedDisabled += 1;
    if (result.digestSent) summary.digestsSent += 1;
    summary.autoRemindersSent += result.autoRemindersSent;
  }

  if (!isEmailConfigured()) {
    summary.skippedEmailOff = summary.processed;
  }

  return summary;
}
