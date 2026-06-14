import { IntegrationProvider, type Prisma } from "@prisma/client";

import {
  isShopifyMarketsB2bCollectorQueueEnabled,
  resolveB2bCollectorDigestEnabled,
  shouldSendB2bCollectorDigest,
} from "@/lib/commercial/shopify-market-b2b-collector-queue";
import { SITE_URL } from "@/lib/constants";
import { isEmailConfigured, sendB2bArCollectorDigest } from "@/lib/email";
import {
  buildB2bCollectorDigestPreview,
  buildB2bCollectorQueueSnapshot,
  defaultSnoozedUntil,
  incrementB2bCollectorQueueStats,
  syncB2bCollectorTasks,
  type B2bArCollectorQueueSnapshot,
  type B2bArCollectorQueueStats,
  type B2bArCollectorTask,
  type B2bArCollectorTaskStatus,
} from "@/lib/integrations/shopify-b2b-collector-queue-metadata";
import type { B2bArCompanyRollup, B2bArDashboardRow } from "@/lib/integrations/shopify-b2b-ar-dashboard-metadata";
import {
  mergeShopifyMarketsSyncSettings,
  parseShopifyMarketsSyncSettings,
} from "@/lib/integrations/shopify-markets-settings";
import { prisma } from "@/lib/prisma";
import { recordBillingEvent } from "@/services/billing/billing-service";

export type B2bCollectorDigestRunResult = {
  connectionId: string;
  userId: string;
  digestSent: boolean;
  skippedReason?: string;
};

export type B2bCollectorDigestCronSummary = {
  processed: number;
  digestsSent: number;
  skippedEmailOff: number;
  skippedRecentDigest: number;
  skippedNoTasks: number;
};

async function recordCollectorQueueStats(input: {
  connectionId: string;
  patch: Partial<B2bArCollectorQueueStats>;
  syncAt?: string;
  digestAt?: string;
  tasks?: B2bArCollectorTask[];
}) {
  const conn = await prisma.integrationConnection.findUnique({
    where: { id: input.connectionId },
    select: { settingsJson: true },
  });
  if (!conn) return;

  const sync = parseShopifyMarketsSyncSettings(conn.settingsJson);
  const nextStats = incrementB2bCollectorQueueStats(sync.b2bCollectorQueueStats, input.patch);
  await prisma.integrationConnection.update({
    where: { id: input.connectionId },
    data: {
      settingsJson: mergeShopifyMarketsSyncSettings(conn.settingsJson, {
        b2bCollectorQueueStats: nextStats,
        ...(input.tasks ? { b2bArCollectorTasks: input.tasks } : {}),
        ...(input.syncAt ? { lastB2bCollectorQueueSyncAt: input.syncAt } : {}),
        ...(input.digestAt ? { lastB2bCollectorDigestAt: input.digestAt } : {}),
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

export async function syncB2bCollectorQueueForConnection(input: {
  connectionId: string;
  companies: B2bArCompanyRollup[];
  rows: B2bArDashboardRow[];
  collectorsByCompanyId: Record<string, string>;
}): Promise<B2bArCollectorQueueSnapshot | null> {
  if (!isShopifyMarketsB2bCollectorQueueEnabled()) return null;

  const conn = await prisma.integrationConnection.findUnique({
    where: { id: input.connectionId },
    select: { settingsJson: true },
  });
  if (!conn) return null;

  const sync = parseShopifyMarketsSyncSettings(conn.settingsJson);
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();

  const { tasks, created, completed } = syncB2bCollectorTasks({
    companies: input.companies,
    rows: input.rows,
    collectorsByCompanyId: input.collectorsByCompanyId,
    slaByCompany: sync.b2bArCollectorSlaDaysByCompanyId,
    defaultSlaDays: sync.b2bArCollectorDefaultSlaDays,
    existingTasks: sync.b2bArCollectorTasks,
    nowMs,
  });

  await recordCollectorQueueStats({
    connectionId: input.connectionId,
    patch: {
      syncRuns: 1,
      tasksCreated: created,
      tasksCompleted: completed,
    },
    syncAt: nowIso,
    tasks,
  });

  return buildB2bCollectorQueueSnapshot(tasks, nowMs);
}

export async function updateB2bCollectorTaskStatus(input: {
  userId: string;
  connectionId: string;
  taskId: string;
  status: B2bArCollectorTaskStatus;
  notes?: string | null;
  snoozedUntil?: string | null;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!isShopifyMarketsB2bCollectorQueueEnabled()) {
    return { ok: false, reason: "disabled" };
  }

  const conn = await prisma.integrationConnection.findFirst({
    where: { id: input.connectionId, userId: input.userId, provider: IntegrationProvider.SHOPIFY },
    select: { settingsJson: true },
  });
  if (!conn) return { ok: false, reason: "no_connection" };

  const sync = parseShopifyMarketsSyncSettings(conn.settingsJson);
  const tasks = [...(sync.b2bArCollectorTasks ?? [])];
  const index = tasks.findIndex((task) => task.taskId === input.taskId);
  if (index < 0) return { ok: false, reason: "task_not_found" };

  const nowIso = new Date().toISOString();
  const current = tasks[index]!;
  const next: B2bArCollectorTask = {
    ...current,
    status: input.status,
    updatedAt: nowIso,
    notes: input.notes?.trim() ? input.notes.trim() : current.notes,
    snoozedUntil:
      input.status === "snoozed"
        ? input.snoozedUntil ?? defaultSnoozedUntil()
        : null,
    completedAt: input.status === "done" ? nowIso : null,
  };
  tasks[index] = next;

  await recordCollectorQueueStats({
    connectionId: input.connectionId,
    patch: {
      tasksSnoozed: input.status === "snoozed" ? 1 : 0,
      tasksCompleted: input.status === "done" ? 1 : 0,
    },
    tasks,
  });

  return { ok: true };
}

export async function setB2bCollectorSlaForCompany(input: {
  userId: string;
  connectionId: string;
  companyAccountId: string;
  slaDays: number;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const conn = await prisma.integrationConnection.findFirst({
    where: { id: input.connectionId, userId: input.userId, provider: IntegrationProvider.SHOPIFY },
    select: { settingsJson: true },
  });
  if (!conn) return { ok: false, reason: "no_connection" };

  const sync = parseShopifyMarketsSyncSettings(conn.settingsJson);
  const nextSla = { ...(sync.b2bArCollectorSlaDaysByCompanyId ?? {}) };
  const days = Math.max(1, Math.round(input.slaDays));
  nextSla[input.companyAccountId] = days;

  await prisma.integrationConnection.update({
    where: { id: input.connectionId },
    data: {
      settingsJson: mergeShopifyMarketsSyncSettings(conn.settingsJson, {
        b2bArCollectorSlaDaysByCompanyId: nextSla,
      }) as Prisma.InputJsonValue,
    },
  });

  return { ok: true };
}

export async function buildB2bCollectorDigestPreviewForConnection(input: {
  userId: string;
  connectionId: string;
}): Promise<ReturnType<typeof buildB2bCollectorDigestPreview> | null> {
  if (!isShopifyMarketsB2bCollectorQueueEnabled()) return null;

  const conn = await prisma.integrationConnection.findUnique({
    where: { id: input.connectionId },
    select: { settingsJson: true },
  });
  if (!conn) return null;

  const sync = parseShopifyMarketsSyncSettings(conn.settingsJson);
  const snapshot = buildB2bCollectorQueueSnapshot(sync.b2bArCollectorTasks ?? []);

  return buildB2bCollectorDigestPreview({
    snapshot,
    digestEnabled: resolveB2bCollectorDigestEnabled(sync.b2bCollectorDigestEnabled),
    lastDigestAt: sync.lastB2bCollectorDigestAt,
  });
}

export async function runB2bCollectorDigestForConnection(input: {
  userId: string;
  workspaceId: string | null;
  connectionId: string;
  forceDigest?: boolean;
}): Promise<B2bCollectorDigestRunResult> {
  const runAt = new Date().toISOString();

  if (!isShopifyMarketsB2bCollectorQueueEnabled()) {
    return {
      connectionId: input.connectionId,
      userId: input.userId,
      digestSent: false,
      skippedReason: "disabled",
    };
  }

  const conn = await prisma.integrationConnection.findUnique({
    where: { id: input.connectionId },
    select: { settingsJson: true },
  });
  if (!conn) {
    return {
      connectionId: input.connectionId,
      userId: input.userId,
      digestSent: false,
      skippedReason: "no_connection",
    };
  }

  const sync = parseShopifyMarketsSyncSettings(conn.settingsJson);
  if (!resolveB2bCollectorDigestEnabled(sync.b2bCollectorDigestEnabled)) {
    return {
      connectionId: input.connectionId,
      userId: input.userId,
      digestSent: false,
      skippedReason: "digest_disabled",
    };
  }

  const snapshot = buildB2bCollectorQueueSnapshot(sync.b2bArCollectorTasks ?? []);
  const preview = buildB2bCollectorDigestPreview({
    snapshot,
    digestEnabled: true,
    lastDigestAt: sync.lastB2bCollectorDigestAt,
  });

  if (preview.openCount === 0) {
    await recordCollectorQueueStats({
      connectionId: input.connectionId,
      patch: { skippedNoTasks: 1 },
    });
    return {
      connectionId: input.connectionId,
      userId: input.userId,
      digestSent: false,
      skippedReason: "no_tasks",
    };
  }

  if (!isEmailConfigured()) {
    await recordCollectorQueueStats({
      connectionId: input.connectionId,
      patch: { skippedEmailOff: 1 },
    });
    return {
      connectionId: input.connectionId,
      userId: input.userId,
      digestSent: false,
      skippedReason: "email_off",
    };
  }

  const digestDue =
    input.forceDigest === true || shouldSendB2bCollectorDigest(sync.lastB2bCollectorDigestAt);
  if (!digestDue) {
    await recordCollectorQueueStats({
      connectionId: input.connectionId,
      patch: { skippedRecentDigest: 1 },
    });
    return {
      connectionId: input.connectionId,
      userId: input.userId,
      digestSent: false,
      skippedReason: "recent_digest",
    };
  }

  const ownerEmail = await resolveOwnerEmail(input.userId);
  if (!ownerEmail) {
    return {
      connectionId: input.connectionId,
      userId: input.userId,
      digestSent: false,
      skippedReason: "no_owner_email",
    };
  }

  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: input.userId },
    select: { businessName: true },
  });

  const result = await sendB2bArCollectorDigest({
    to: ownerEmail,
    businessName: kitchen?.businessName,
    openCount: preview.openCount,
    slaBreachedCount: preview.slaBreachedCount,
    tasksByAssignee: preview.tasksByAssignee.map((group) => ({
      assignee: group.assignee,
      tasks: group.tasks.map((task) => ({
        companyName: task.companyName,
        maxDaysPastDue: task.maxDaysPastDue,
        openAmountCents: task.openAmountCents,
        slaBreached: task.slaBreached,
        priority: task.priority,
      })),
    })),
    receivablesUrl: `${SITE_URL}/dashboard/receivables`,
  });

  if (!("sent" in result) || !result.sent) {
    return {
      connectionId: input.connectionId,
      userId: input.userId,
      digestSent: false,
      skippedReason: "send_failed",
    };
  }

  await recordCollectorQueueStats({
    connectionId: input.connectionId,
    patch: { digestsSent: 1 },
    digestAt: runAt,
  });

  await recordBillingEvent({
    userId: input.userId,
    workspaceId: input.workspaceId,
    eventType: "B2B_AR_COLLECTOR_DIGEST_SENT",
    source: "internal",
    summary: `B2B collector digest — ${preview.openCount} task(s), ${preview.slaBreachedCount} SLA breach(es)`,
    metadata: {
      connectionId: input.connectionId,
      openCount: preview.openCount,
      slaBreachedCount: preview.slaBreachedCount,
    },
  }).catch(() => undefined);

  return {
    connectionId: input.connectionId,
    userId: input.userId,
    digestSent: true,
  };
}

export async function runB2bCollectorDigestCronForAllConnections(): Promise<B2bCollectorDigestCronSummary> {
  if (!isShopifyMarketsB2bCollectorQueueEnabled()) {
    return {
      processed: 0,
      digestsSent: 0,
      skippedEmailOff: 0,
      skippedRecentDigest: 0,
      skippedNoTasks: 0,
    };
  }

  const connections = await prisma.integrationConnection.findMany({
    where: {
      provider: IntegrationProvider.SHOPIFY,
      accessTokenEncrypted: { not: null },
    },
    select: { id: true, userId: true, workspaceId: true },
    take: 200,
  });

  const summary: B2bCollectorDigestCronSummary = {
    processed: 0,
    digestsSent: 0,
    skippedEmailOff: 0,
    skippedRecentDigest: 0,
    skippedNoTasks: 0,
  };

  for (const conn of connections) {
    const result = await runB2bCollectorDigestForConnection({
      userId: conn.userId,
      workspaceId: conn.workspaceId,
      connectionId: conn.id,
    }).catch(() => null);

    summary.processed += 1;
    if (!result) continue;
    if (result.digestSent) summary.digestsSent += 1;
    if (result.skippedReason === "email_off") summary.skippedEmailOff += 1;
    if (result.skippedReason === "recent_digest") summary.skippedRecentDigest += 1;
    if (result.skippedReason === "no_tasks") summary.skippedNoTasks += 1;
  }

  return summary;
}
