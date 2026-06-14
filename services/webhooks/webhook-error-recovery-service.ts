import {
  ErrorRecoveryItemStatus,
  ErrorRecoverySource,
  IntegrationProvider,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { errorRecoveryItemListWhereForOwner } from "@/lib/scope/workspace-error-recovery-scope";

const SOURCE = ErrorRecoverySource.WEBHOOK_JOB;

function sourceKeyForWebhookJob(jobId: string): string {
  return `webhook_job:${jobId}`;
}

export async function upsertWebhookJobFailureRecoveryItem(params: {
  jobId: string;
  userId: string;
  workspaceId: string | null;
  provider: IntegrationProvider;
  eventType: string;
  webhookEventId: string;
  lastError: string | null;
  attempts: number | null;
  maxAttempts: number | null;
}): Promise<void> {
  const sourceId = sourceKeyForWebhookJob(params.jobId);
  const safeHref = "/dashboard/sales-channels/webhooks";
  const suggested =
    "Inspect signing + connection health; use audited replay only after fixing root cause (may duplicate commerce writes).";

  await prisma.errorRecoveryItem.upsert({
    where: { source_sourceId: { source: SOURCE, sourceId } },
    create: {
      source: SOURCE,
      sourceId,
      userId: params.userId,
      workspaceId: params.workspaceId,
      provider: params.provider,
      eventType: params.eventType,
      webhookEventId: params.webhookEventId,
      webhookJobId: params.jobId,
      status: ErrorRecoveryItemStatus.OPEN,
      severity: "high",
      lastError: params.lastError,
      attempts: params.attempts ?? undefined,
      maxAttempts: params.maxAttempts ?? undefined,
      suggestedAction: suggested,
      safeRetryHref: safeHref,
    },
    update: {
      status: ErrorRecoveryItemStatus.OPEN,
      lastError: params.lastError,
      attempts: params.attempts ?? undefined,
      maxAttempts: params.maxAttempts ?? undefined,
      suggestedAction: suggested,
      safeRetryHref: safeHref,
      workspaceId: params.workspaceId ?? undefined,
      webhookJobId: params.jobId,
      webhookEventId: params.webhookEventId,
    },
  });
}

export async function resolveWebhookJobRecoveryItemIfExists(jobId: string): Promise<void> {
  const sourceId = sourceKeyForWebhookJob(jobId);
  const row = await prisma.errorRecoveryItem.findUnique({
    where: { source_sourceId: { source: SOURCE, sourceId } },
  });
  if (!row || row.status === ErrorRecoveryItemStatus.RESOLVED) return;
  await prisma.errorRecoveryItem.update({
    where: { id: row.id },
    data: { status: ErrorRecoveryItemStatus.RESOLVED },
  });
}

export async function countOpenWebhookJobRecoveriesForUser(userId: string): Promise<number> {
  const scope = await errorRecoveryItemListWhereForOwner(userId);
  return prisma.errorRecoveryItem.count({
    where: {
      AND: [scope, { source: SOURCE, status: ErrorRecoveryItemStatus.OPEN }],
    },
  });
}

export async function countOpenWebhookJobRecoveries(): Promise<number> {
  return prisma.errorRecoveryItem.count({
    where: { source: SOURCE, status: ErrorRecoveryItemStatus.OPEN },
  });
}

export async function listOpenWebhookJobRecoveriesForUser(
  userId: string,
  take: number,
): Promise<
  {
    id: string;
    provider: string | null;
    eventType: string | null;
    lastError: string | null;
    attempts: number | null;
    maxAttempts: number | null;
    webhookEventId: string | null;
    webhookJobId: string | null;
    updatedAt: Date;
  }[]
> {
  const scope = await errorRecoveryItemListWhereForOwner(userId);
  return prisma.errorRecoveryItem.findMany({
    where: {
      AND: [scope, { source: SOURCE, status: ErrorRecoveryItemStatus.OPEN }],
    },
    orderBy: { updatedAt: "desc" },
    take,
    select: {
      id: true,
      provider: true,
      eventType: true,
      lastError: true,
      attempts: true,
      maxAttempts: true,
      webhookEventId: true,
      webhookJobId: true,
      updatedAt: true,
    },
  });
}

export async function listOpenWebhookJobRecoveries(
  take: number,
): Promise<
  {
    id: string;
    provider: string | null;
    eventType: string | null;
    lastError: string | null;
    attempts: number | null;
    maxAttempts: number | null;
    webhookEventId: string | null;
    webhookJobId: string | null;
    updatedAt: Date;
  }[]
> {
  return prisma.errorRecoveryItem.findMany({
    where: { source: SOURCE, status: ErrorRecoveryItemStatus.OPEN },
    orderBy: { updatedAt: "desc" },
    take,
    select: {
      id: true,
      provider: true,
      eventType: true,
      lastError: true,
      attempts: true,
      maxAttempts: true,
      webhookEventId: true,
      webhookJobId: true,
      updatedAt: true,
    },
  });
}
