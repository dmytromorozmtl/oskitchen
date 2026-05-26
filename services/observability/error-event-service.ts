import {
  AutomationExecutionStatus,
  ChannelImportBatchStatus,
  ChannelSyncJobStatus,
  ErrorRecoveryItemStatus,
  ErrorRecoverySource,
  ExportJobStatus,
  ImportStatus,
} from "@prisma/client";

import { redactFreeText } from "@/lib/observability/redaction";
import type { ModuleHealthTag, ObservabilityRollupCounts } from "@/lib/observability/status-types";
import type { ObservabilitySeverity } from "@/lib/observability/severity";
import { channelImportBatchListWhereForOwner } from "@/lib/scope/channel-import-scope";
import { channelSyncJobListWhereForOwner } from "@/lib/scope/workspace-channel-scope";
import { errorRecoveryItemListWhereForOwner } from "@/lib/scope/workspace-error-recovery-scope";
import {
  automationRuleListWhereForOwner,
  notificationLogListWhereForOwner,
  webhookEventListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import {
  exportJobListWhereForOwner,
  importJobListWhereForOwner,
} from "@/lib/scope/workspace-import-export-scope";
import { prisma } from "@/lib/prisma";
import { listOpenWebhookJobRecoveriesForUser } from "@/services/webhooks/webhook-error-recovery-service";

export type ObservabilityErrorEvent = {
  id: string;
  severity: ObservabilitySeverity;
  workspaceId: string | null;
  workspaceLabel: string | null;
  module: ModuleHealthTag;
  provider: string | null;
  affectedEntityType: string;
  affectedEntityId: string | null;
  summary: string;
  firstSeen: Date;
  lastSeen: Date;
  retryCount: number;
  nextRecommendedAction: string;
  safeRetryHref: string | null;
  supportTicketHref: string | null;
  auditHref: string | null;
};

const since7d = () => new Date(Date.now() - 7 * 864e5);

function workspaceLinks(isPlatformView: boolean) {
  const audit = isPlatformView ? "/platform/audit" : "/dashboard/audit-logs";
  const support = isPlatformView ? "/platform/support" : "/dashboard/support/inbox";
  return { audit, support };
}

function pickRetryHref(module: ModuleHealthTag, isPlatformView: boolean): string | null {
  if (isPlatformView) {
    if (module === "WEBHOOKS") return "/platform/webhooks";
    if (module === "CHANNEL_SYNC") return "/platform/integrations";
    if (module === "NOTIFICATIONS") return "/platform/notifications";
    if (module === "IMPORTS") return "/platform/tools";
    if (module === "EXPORTS") return "/platform/tools";
    if (module === "AUTOMATIONS") return "/platform/automations";
    if (module === "AUDIT") return "/platform/audit";
    return "/platform/error-recovery";
  }
  if (module === "WEBHOOKS") return "/dashboard/sales-channels/webhooks";
  if (module === "CHANNEL_SYNC") return "/dashboard/sales-channels/health";
  if (module === "NOTIFICATIONS") return "/dashboard/notifications/retry";
  if (module === "IMPORTS") return "/dashboard/import-center/history";
  if (module === "EXPORTS") return "/dashboard/import-export/exports";
  if (module === "AUTOMATIONS") return "/dashboard/notifications/rules";
  if (module === "AUDIT") return "/dashboard/audit-logs";
  return "/dashboard/error-recovery";
}

async function resolveWorkspaceLabels(
  ownerUserIds: string[],
): Promise<Map<string, { workspaceId: string; label: string }>> {
  const unique = [...new Set(ownerUserIds.filter(Boolean))];
  if (unique.length === 0) return new Map();
  const workspaces = await prisma.workspace.findMany({
    where: { ownerUserId: { in: unique } },
    select: { id: true, name: true, ownerUserId: true },
  });
  const map = new Map<string, { workspaceId: string; label: string }>();
  for (const w of workspaces) {
    map.set(w.ownerUserId, { workspaceId: w.id, label: w.name });
  }
  return map;
}

export async function getObservabilityRollupCountsForUser(userId: string): Promise<ObservabilityRollupCounts> {
  const from = since7d();
  const [webhookWhere, syncJobWhere, batchWhere, recoveryWhere, importScope, exportScope, notificationScope, automationScope] =
    await Promise.all([
    webhookEventListWhereForOwner(userId),
    channelSyncJobListWhereForOwner(userId),
    channelImportBatchListWhereForOwner(userId),
    errorRecoveryItemListWhereForOwner(userId),
    importJobListWhereForOwner(userId),
    exportJobListWhereForOwner(userId),
    notificationLogListWhereForOwner(userId),
    automationRuleListWhereForOwner(userId),
  ]);
  const [
    webhookQueued,
    webhookProcessingErrors7d,
    channelSyncFailed,
    notificationFailures7d,
    importJobsFailed,
    channelImportBatchesFailed,
    exportJobsFailed,
    automationExecutionsFailed7d,
    auditExportsFailed7d,
    openWebhookJobRecoveries,
  ] = await Promise.all([
    prisma.webhookEvent.count({ where: { AND: [webhookWhere, { processed: false }] } }),
    prisma.webhookEvent.count({
      where: { AND: [webhookWhere, { receivedAt: { gte: from }, processingError: { not: null } }] },
    }),
    prisma.channelSyncJob.count({
      where: { AND: [syncJobWhere, { status: ChannelSyncJobStatus.FAILED }] },
    }),
    prisma.notificationLog.count({
      where: {
        AND: [
          notificationScope,
          {
            createdAt: { gte: from },
            OR: [{ errorMessage: { not: null } }, { status: "FAILED" }, { failedAt: { not: null } }],
          },
        ],
      },
    }),
    prisma.importJob.count({ where: { AND: [importScope, { status: ImportStatus.FAILED }] } }),
    prisma.channelImportBatch.count({
      where: { AND: [batchWhere, { status: ChannelImportBatchStatus.FAILED }] },
    }),
    prisma.exportJob.count({ where: { AND: [exportScope, { status: ExportJobStatus.FAILED }] } }),
    prisma.automationExecution.count({
      where: {
        status: AutomationExecutionStatus.FAILED,
        startedAt: { gte: from },
        rule: automationScope,
      },
    }),
    prisma.auditExport.count({
      where: {
        workspace: { ownerUserId: userId },
        status: "FAILED",
        createdAt: { gte: from },
      },
    }),
    prisma.errorRecoveryItem.count({
      where: {
        AND: [
          recoveryWhere,
          { source: ErrorRecoverySource.WEBHOOK_JOB, status: ErrorRecoveryItemStatus.OPEN },
        ],
      },
    }),
  ]);

  return {
    webhookQueued,
    webhookProcessingErrors7d,
    channelSyncFailed,
    notificationFailures7d,
    importJobsFailed,
    channelImportBatchesFailed,
    exportJobsFailed,
    automationExecutionsFailed7d,
    auditExportsFailed7d,
    openWebhookJobRecoveries,
  };
}

export async function getPlatformObservabilityRollupCounts(): Promise<ObservabilityRollupCounts> {
  const from = since7d();
  const [
    webhookQueued,
    webhookProcessingErrors7d,
    channelSyncFailed,
    notificationFailures7d,
    importJobsFailed,
    channelImportBatchesFailed,
    exportJobsFailed,
    automationExecutionsFailed7d,
    auditExportsFailed7d,
    openWebhookJobRecoveries,
  ] = await Promise.all([
    prisma.webhookEvent.count({ where: { processed: false } }),
    prisma.webhookEvent.count({
      where: { receivedAt: { gte: from }, processingError: { not: null } },
    }),
    prisma.channelSyncJob.count({ where: { status: ChannelSyncJobStatus.FAILED } }),
    prisma.notificationLog.count({
      where: {
        createdAt: { gte: from },
        OR: [{ errorMessage: { not: null } }, { status: "FAILED" }, { failedAt: { not: null } }],
      },
    }),
    prisma.importJob.count({ where: { status: ImportStatus.FAILED } }),
    prisma.channelImportBatch.count({ where: { status: ChannelImportBatchStatus.FAILED } }),
    prisma.exportJob.count({ where: { status: ExportJobStatus.FAILED } }),
    prisma.automationExecution.count({
      where: { status: AutomationExecutionStatus.FAILED, startedAt: { gte: from } },
    }),
    prisma.auditExport.count({
      where: { status: "FAILED", createdAt: { gte: from } },
    }),
    prisma.errorRecoveryItem.count({
      where: {
        source: ErrorRecoverySource.WEBHOOK_JOB,
        status: ErrorRecoveryItemStatus.OPEN,
      },
    }),
  ]);

  return {
    webhookQueued,
    webhookProcessingErrors7d,
    channelSyncFailed,
    notificationFailures7d,
    importJobsFailed,
    channelImportBatchesFailed,
    exportJobsFailed,
    automationExecutionsFailed7d,
    auditExportsFailed7d,
    openWebhookJobRecoveries,
  };
}

type RawEvent = Omit<ObservabilityErrorEvent, "severity"> & { severity?: ObservabilitySeverity };

function finalize(e: RawEvent): ObservabilityErrorEvent {
  const severity: ObservabilitySeverity = e.severity ?? "medium";
  return { ...e, severity };
}

export async function listWorkspaceErrorEvents(
  userId: string,
  limit: number,
): Promise<ObservabilityErrorEvent[]> {
  const { audit, support } = workspaceLinks(false);
  const from = since7d();
  const [webhookWhere, syncJobWhere, batchWhere, importScope, exportScope, notificationScope, automationScope] =
    await Promise.all([
    webhookEventListWhereForOwner(userId),
    channelSyncJobListWhereForOwner(userId),
    channelImportBatchListWhereForOwner(userId),
    importJobListWhereForOwner(userId),
    exportJobListWhereForOwner(userId),
    notificationLogListWhereForOwner(userId),
    automationRuleListWhereForOwner(userId),
  ]);
  const [webhooks, syncJobs, notifs, imports, batches, exports, auto, auditExports] = await Promise.all([
    prisma.webhookEvent.findMany({
      where: {
        AND: [
          webhookWhere,
          {
            OR: [{ processingError: { not: null } }, { signatureValid: false }],
            receivedAt: { gte: from },
          },
        ],
      },
      orderBy: { receivedAt: "desc" },
      take: Math.min(limit, 25),
      select: {
        id: true,
        provider: true,
        topic: true,
        processingError: true,
        receivedAt: true,
        processed: true,
        signatureValid: true,
      },
    }),
    prisma.channelSyncJob.findMany({
      where: { AND: [syncJobWhere, { status: ChannelSyncJobStatus.FAILED }] },
      orderBy: { startedAt: "desc" },
      take: Math.min(limit, 15),
      select: {
        id: true,
        provider: true,
        type: true,
        errorMessage: true,
        startedAt: true,
      },
    }),
    prisma.notificationLog.findMany({
      where: {
        AND: [
          notificationScope,
          {
            OR: [{ errorMessage: { not: null } }, { status: "FAILED" }, { failedAt: { not: null } }],
            createdAt: { gte: from },
          },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 15),
      select: {
        id: true,
        type: true,
        channel: true,
        provider: true,
        errorMessage: true,
        createdAt: true,
        retryCount: true,
      },
    }),
    prisma.importJob.findMany({
      where: { AND: [importScope, { status: ImportStatus.FAILED }] },
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 10),
      select: { id: true, type: true, errorMessage: true, createdAt: true },
    }),
    prisma.channelImportBatch.findMany({
      where: { AND: [batchWhere, { status: ChannelImportBatchStatus.FAILED }] },
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 10),
      select: { id: true, sourceType: true, createdAt: true },
    }),
    prisma.exportJob.findMany({
      where: { AND: [exportScope, { status: ExportJobStatus.FAILED }] },
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 10),
      select: { id: true, type: true, createdAt: true },
    }),
    prisma.automationExecution.findMany({
      where: {
        status: AutomationExecutionStatus.FAILED,
        startedAt: { gte: from },
        rule: automationScope,
      },
      orderBy: { startedAt: "desc" },
      take: Math.min(limit, 15),
      select: {
        id: true,
        errorMessage: true,
        startedAt: true,
        rule: { select: { name: true } },
      },
    }),
    prisma.auditExport.findMany({
      where: { workspace: { ownerUserId: userId }, status: "FAILED", createdAt: { gte: from } },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, errorMessage: true, createdAt: true, workspaceId: true },
    }),
  ]);

  const ws = await prisma.workspace.findFirst({
    where: { ownerUserId: userId },
    select: { id: true, name: true },
  });

  const raw: RawEvent[] = [];

  for (const w of webhooks) {
    const summary = redactFreeText(
      w.processingError ?? (w.signatureValid ? "Webhook issue" : "Invalid webhook signature"),
    );
    raw.push({
      id: `webhook:${w.id}`,
      module: "WEBHOOKS",
      provider: w.provider,
      affectedEntityType: "WebhookEvent",
      affectedEntityId: w.id,
      summary: `${w.topic}: ${summary}`,
      firstSeen: w.receivedAt,
      lastSeen: w.receivedAt,
      retryCount: w.processed ? 0 : 1,
      nextRecommendedAction: "Verify signing secret, replay safely after fix, or mark skipped in channel tools.",
      safeRetryHref: pickRetryHref("WEBHOOKS", false),
      supportTicketHref: support,
      auditHref: audit,
      workspaceId: ws?.id ?? null,
      workspaceLabel: ws?.name ?? null,
      severity: w.signatureValid === false ? "high" : "medium",
    });
  }

  for (const j of syncJobs) {
    raw.push({
      id: `sync:${j.id}`,
      module: "CHANNEL_SYNC",
      provider: j.provider,
      affectedEntityType: "ChannelSyncJob",
      affectedEntityId: j.id,
      summary: redactFreeText(`${j.type}: ${j.errorMessage ?? "Sync failed"}`),
      firstSeen: j.startedAt,
      lastSeen: j.startedAt,
      retryCount: 0,
      nextRecommendedAction: "Reconnect integration or re-run sync after correcting credentials/scopes.",
      safeRetryHref: pickRetryHref("CHANNEL_SYNC", false),
      supportTicketHref: support,
      auditHref: audit,
      workspaceId: ws?.id ?? null,
      workspaceLabel: ws?.name ?? null,
      severity: "medium",
    });
  }

  for (const n of notifs) {
    raw.push({
      id: `notification:${n.id}`,
      module: "NOTIFICATIONS",
      provider: n.provider ?? n.channel ?? "notification",
      affectedEntityType: "NotificationLog",
      affectedEntityId: n.id,
      summary: redactFreeText(`${n.type}: ${n.errorMessage ?? "Delivery failed"}`),
      firstSeen: n.createdAt,
      lastSeen: n.createdAt,
      retryCount: n.retryCount,
      nextRecommendedAction: "Check provider configuration, template, and suppression rules.",
      safeRetryHref: pickRetryHref("NOTIFICATIONS", false),
      supportTicketHref: support,
      auditHref: audit,
      workspaceId: ws?.id ?? null,
      workspaceLabel: ws?.name ?? null,
      severity: "medium",
    });
  }

  for (const j of imports) {
    raw.push({
      id: `importJob:${j.id}`,
      module: "IMPORTS",
      provider: String(j.type),
      affectedEntityType: "ImportJob",
      affectedEntityId: j.id,
      summary: redactFreeText(j.errorMessage ?? "Import job failed"),
      firstSeen: j.createdAt,
      lastSeen: j.createdAt,
      retryCount: 0,
      nextRecommendedAction: "Open import history, fix row errors, and re-run with a smaller batch if needed.",
      safeRetryHref: pickRetryHref("IMPORTS", false),
      supportTicketHref: support,
      auditHref: audit,
      workspaceId: ws?.id ?? null,
      workspaceLabel: ws?.name ?? null,
      severity: "low",
    });
  }

  for (const b of batches) {
    raw.push({
      id: `channelImport:${b.id}`,
      module: "IMPORTS",
      provider: String(b.sourceType),
      affectedEntityType: "ChannelImportBatch",
      affectedEntityId: b.id,
      summary: "Channel import batch failed — open import center for row-level errors.",
      firstSeen: b.createdAt,
      lastSeen: b.createdAt,
      retryCount: 0,
      nextRecommendedAction: "Review connector import batch, resolve validation rows, then retry import.",
      safeRetryHref: pickRetryHref("IMPORTS", false),
      supportTicketHref: support,
      auditHref: audit,
      workspaceId: ws?.id ?? null,
      workspaceLabel: ws?.name ?? null,
      severity: "medium",
    });
  }

  for (const e of exports) {
    raw.push({
      id: `export:${e.id}`,
      module: "EXPORTS",
      provider: e.type,
      affectedEntityType: "ExportJob",
      affectedEntityId: e.id,
      summary: "Export job failed — see export history (details redacted).",
      firstSeen: e.createdAt,
      lastSeen: e.createdAt,
      retryCount: 0,
      nextRecommendedAction: "Retry export with narrower filters; if repeated, capture request id in support ticket.",
      safeRetryHref: pickRetryHref("EXPORTS", false),
      supportTicketHref: support,
      auditHref: audit,
      workspaceId: ws?.id ?? null,
      workspaceLabel: ws?.name ?? null,
      severity: "low",
    });
  }

  for (const a of auto) {
    raw.push({
      id: `automation:${a.id}`,
      module: "AUTOMATIONS",
      provider: null,
      affectedEntityType: "AutomationExecution",
      affectedEntityId: a.id,
      summary: redactFreeText(`${a.rule.name}: ${a.errorMessage ?? "Automation failed"}`),
      firstSeen: a.startedAt,
      lastSeen: a.startedAt,
      retryCount: 0,
      nextRecommendedAction: "Inspect rule configuration and last trigger payload (redacted in logs).",
      safeRetryHref: pickRetryHref("AUTOMATIONS", false),
      supportTicketHref: support,
      auditHref: audit,
      workspaceId: ws?.id ?? null,
      workspaceLabel: ws?.name ?? null,
      severity: "medium",
    });
  }

  for (const x of auditExports) {
    raw.push({
      id: `auditExport:${x.id}`,
      module: "AUDIT",
      provider: "audit_export",
      affectedEntityType: "AuditExport",
      affectedEntityId: x.id,
      summary: redactFreeText(x.errorMessage ?? "Audit export failed"),
      firstSeen: x.createdAt,
      lastSeen: x.createdAt,
      retryCount: 0,
      nextRecommendedAction: "Retry export with a smaller window; confirm retention policy and storage destination.",
      safeRetryHref: pickRetryHref("AUDIT", false),
      supportTicketHref: support,
      auditHref: audit,
      workspaceId: x.workspaceId,
      workspaceLabel: ws?.name ?? null,
      severity: "low",
    });
  }

  const jobFailures = await listOpenWebhookJobRecoveriesForUser(userId, Math.min(limit, 20));
  for (const r of jobFailures) {
    const attempts = r.attempts ?? 0;
    const max = r.maxAttempts ?? "?";
    raw.push({
      id: `errorRecovery:${r.id}`,
      module: "WEBHOOKS",
      provider: r.provider,
      affectedEntityType: "WebhookProcessingJob",
      affectedEntityId: r.webhookJobId ?? r.id,
      summary: `Async webhook job exhausted retries (${attempts}/${max}): ${r.eventType ?? "unknown"} — ${redactFreeText(r.lastError ?? "unknown error")}`,
      firstSeen: r.updatedAt,
      lastSeen: r.updatedAt,
      retryCount: attempts,
      nextRecommendedAction:
        "Open webhooks, verify connector health, then use audited replay only after fixing the root cause (may duplicate commerce writes).",
      safeRetryHref: pickRetryHref("WEBHOOKS", false),
      supportTicketHref: support,
      auditHref: audit,
      workspaceId: ws?.id ?? null,
      workspaceLabel: ws?.name ?? null,
      severity: "high",
    });
  }

  raw.sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime());
  return raw.slice(0, limit).map(finalize);
}

export async function listPlatformErrorEvents(limit: number): Promise<ObservabilityErrorEvent[]> {
  const { audit, support } = workspaceLinks(true);
  const from = since7d();
  const [webhooks, syncJobs, notifs, auto] = await Promise.all([
    prisma.webhookEvent.findMany({
      where: {
        OR: [{ processingError: { not: null } }, { signatureValid: false }],
        receivedAt: { gte: from },
      },
      orderBy: { receivedAt: "desc" },
      take: Math.min(limit, 40),
      select: {
        id: true,
        userId: true,
        provider: true,
        topic: true,
        processingError: true,
        receivedAt: true,
        processed: true,
        signatureValid: true,
      },
    }),
    prisma.channelSyncJob.findMany({
      where: { status: ChannelSyncJobStatus.FAILED },
      orderBy: { startedAt: "desc" },
      take: Math.min(limit, 25),
      select: {
        id: true,
        userId: true,
        provider: true,
        type: true,
        errorMessage: true,
        startedAt: true,
      },
    }),
    prisma.notificationLog.findMany({
      where: {
        createdAt: { gte: from },
        OR: [{ errorMessage: { not: null } }, { status: "FAILED" }, { failedAt: { not: null } }],
      },
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 25),
      select: {
        id: true,
        userId: true,
        type: true,
        channel: true,
        provider: true,
        errorMessage: true,
        createdAt: true,
        retryCount: true,
      },
    }),
    prisma.automationExecution.findMany({
      where: { status: AutomationExecutionStatus.FAILED, startedAt: { gte: from } },
      orderBy: { startedAt: "desc" },
      take: Math.min(limit, 25),
      include: { rule: { select: { name: true, userId: true } } },
    }),
  ]);

  const recoveries = await prisma.errorRecoveryItem.findMany({
    where: {
      source: ErrorRecoverySource.WEBHOOK_JOB,
      status: ErrorRecoveryItemStatus.OPEN,
      updatedAt: { gte: from },
    },
    orderBy: { updatedAt: "desc" },
    take: Math.min(limit, 30),
    select: {
      id: true,
      userId: true,
      workspaceId: true,
      provider: true,
      eventType: true,
      lastError: true,
      attempts: true,
      maxAttempts: true,
      updatedAt: true,
      webhookEventId: true,
      webhookJobId: true,
    },
  });

  const ownerIds = [
    ...webhooks.map((w) => w.userId),
    ...syncJobs.map((j) => j.userId),
    ...notifs.map((n) => n.userId),
    ...auto.map((a) => a.rule.userId),
    ...recoveries.map((r) => r.userId),
  ];
  const labelByOwner = await resolveWorkspaceLabels(ownerIds);

  const raw: RawEvent[] = [];

  for (const w of webhooks) {
    const ws = labelByOwner.get(w.userId);
    const summary = redactFreeText(
      w.processingError ?? (w.signatureValid ? "Webhook issue" : "Invalid webhook signature"),
    );
    raw.push({
      id: `webhook:${w.id}`,
      workspaceId: ws?.workspaceId ?? null,
      workspaceLabel: ws?.label ?? null,
      module: "WEBHOOKS",
      provider: w.provider,
      affectedEntityType: "WebhookEvent",
      affectedEntityId: w.id,
      summary: `${w.topic}: ${summary}`,
      firstSeen: w.receivedAt,
      lastSeen: w.receivedAt,
      retryCount: w.processed ? 0 : 1,
      nextRecommendedAction: "Platform: verify tenant connector health; advise workspace admin to rotate secrets if signing failed.",
      safeRetryHref: pickRetryHref("WEBHOOKS", true),
      supportTicketHref: support,
      auditHref: audit,
      severity: w.signatureValid === false ? "high" : "medium",
    });
  }

  for (const j of syncJobs) {
    const ws = labelByOwner.get(j.userId);
    raw.push({
      id: `sync:${j.id}`,
      workspaceId: ws?.workspaceId ?? null,
      workspaceLabel: ws?.label ?? null,
      module: "CHANNEL_SYNC",
      provider: j.provider,
      affectedEntityType: "ChannelSyncJob",
      affectedEntityId: j.id,
      summary: redactFreeText(`${j.type}: ${j.errorMessage ?? "Sync failed"}`),
      firstSeen: j.startedAt,
      lastSeen: j.startedAt,
      retryCount: 0,
      nextRecommendedAction: "Platform: confirm integration status for workspace; recommend credential test from tenant admin.",
      safeRetryHref: pickRetryHref("CHANNEL_SYNC", true),
      supportTicketHref: support,
      auditHref: audit,
      severity: "medium",
    });
  }

  for (const n of notifs) {
    const ws = labelByOwner.get(n.userId);
    raw.push({
      id: `notification:${n.id}`,
      workspaceId: ws?.workspaceId ?? null,
      workspaceLabel: ws?.label ?? null,
      module: "NOTIFICATIONS",
      provider: n.provider ?? n.channel ?? "notification",
      affectedEntityType: "NotificationLog",
      affectedEntityId: n.id,
      summary: redactFreeText(`${n.type}: ${n.errorMessage ?? "Delivery failed"}`),
      firstSeen: n.createdAt,
      lastSeen: n.createdAt,
      retryCount: n.retryCount,
      nextRecommendedAction: "Platform: check provider incident history; tenant should verify DNS + suppression lists.",
      safeRetryHref: pickRetryHref("NOTIFICATIONS", true),
      supportTicketHref: support,
      auditHref: audit,
      severity: "medium",
    });
  }

  for (const a of auto) {
    const ws = labelByOwner.get(a.rule.userId);
    raw.push({
      id: `automation:${a.id}`,
      workspaceId: ws?.workspaceId ?? null,
      workspaceLabel: ws?.label ?? null,
      module: "AUTOMATIONS",
      provider: null,
      affectedEntityType: "AutomationExecution",
      affectedEntityId: a.id,
      summary: redactFreeText(`${a.rule.name}: ${a.errorMessage ?? "Automation failed"}`),
      firstSeen: a.startedAt,
      lastSeen: a.startedAt,
      retryCount: 0,
      nextRecommendedAction: "Platform: inspect rule definition and last execution metadata (no raw payloads in UI).",
      safeRetryHref: pickRetryHref("AUTOMATIONS", true),
      supportTicketHref: support,
      auditHref: audit,
      severity: "medium",
    });
  }

  for (const r of recoveries) {
    const ws = labelByOwner.get(r.userId);
    const attempts = r.attempts ?? 0;
    const max = r.maxAttempts ?? "?";
    raw.push({
      id: `errorRecovery:${r.id}`,
      workspaceId: r.workspaceId ?? ws?.workspaceId ?? null,
      workspaceLabel: ws?.label ?? null,
      module: "WEBHOOKS",
      provider: r.provider,
      affectedEntityType: "WebhookProcessingJob",
      affectedEntityId: r.webhookJobId ?? r.id,
      summary: `Async webhook job exhausted retries (${attempts}/${max}): ${r.eventType ?? "unknown"} — ${redactFreeText(r.lastError ?? "unknown error")}`,
      firstSeen: r.updatedAt,
      lastSeen: r.updatedAt,
      retryCount: attempts,
      nextRecommendedAction:
        "Platform: verify tenant connector + signing; advise audited replay only after root-cause fix (may duplicate commerce writes).",
      safeRetryHref: pickRetryHref("WEBHOOKS", true),
      supportTicketHref: support,
      auditHref: audit,
      severity: "high",
    });
  }

  raw.sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime());
  return raw.slice(0, limit).map(finalize);
}
