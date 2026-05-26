import {
  ErrorRecoveryItemStatus,
  ErrorRecoverySource,
  WebhookProcessingJobStatus,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { toSafeErrorPreview } from "@/lib/security/sensitive-redaction";

export type PlatformWebhookRecentEventRow = {
  id: string;
  provider: string;
  topic: string;
  receivedAt: Date;
  processed: boolean;
  signatureValid: boolean;
  ownerUserId: string;
  workspaceId: string | null;
  workspaceName: string | null;
  workspaceHref: string | null;
  integrationHealthHref: string | null;
  processingErrorPreview: string | null;
  processingErrorRedacted: boolean;
};

export type PlatformWebhookDlqRow = {
  id: string;
  workspaceId: string | null;
  workspaceName: string | null;
  workspaceHref: string | null;
  integrationHealthHref: string | null;
  provider: string | null;
  eventType: string | null;
  updatedAt: Date;
  attempts: number | null;
  maxAttempts: number | null;
  webhookEventId: string | null;
  webhookJobId: string | null;
  suggestedAction: string | null;
  safeRetryHref: string | null;
  jobStatus: WebhookProcessingJobStatus | null;
  nextAttemptAt: Date | null;
  signatureValid: boolean | null;
  receivedAt: Date | null;
  processed: boolean | null;
  lastErrorPreview: string | null;
  lastErrorRedacted: boolean;
};

function hrefsForWorkspace(workspaceId: string | null): {
  workspaceHref: string | null;
  integrationHealthHref: string | null;
} {
  if (!workspaceId) {
    return {
      workspaceHref: null,
      integrationHealthHref: null,
    };
  }

  return {
    workspaceHref: `/platform/workspaces/${workspaceId}`,
    integrationHealthHref: `/platform/workspaces/${workspaceId}/integration-health`,
  };
}

export async function listPlatformRecentWebhookEvents(
  take: number,
): Promise<PlatformWebhookRecentEventRow[]> {
  const rows = await prisma.webhookEvent.findMany({
    orderBy: { receivedAt: "desc" },
    take,
    select: {
      id: true,
      provider: true,
      topic: true,
      receivedAt: true,
      processed: true,
      signatureValid: true,
      processingError: true,
      userId: true,
    },
  });

  const ownerIds = [...new Set(rows.map((row) => row.userId))];
  const workspaces =
    ownerIds.length === 0
      ? []
      : await prisma.workspace.findMany({
          where: { ownerUserId: { in: ownerIds } },
          select: {
            id: true,
            name: true,
            ownerUserId: true,
          },
        });

  const workspaceByOwnerId = new Map(
    workspaces.map((workspace) => [workspace.ownerUserId, workspace] as const),
  );

  return rows.map((row) => {
    const workspace = workspaceByOwnerId.get(row.userId) ?? null;
    const preview = toSafeErrorPreview(row.processingError, 160);
    const hrefs = hrefsForWorkspace(workspace?.id ?? null);

    return {
      id: row.id,
      provider: String(row.provider),
      topic: row.topic,
      receivedAt: row.receivedAt,
      processed: row.processed,
      signatureValid: row.signatureValid,
      ownerUserId: row.userId,
      workspaceId: workspace?.id ?? null,
      workspaceName: workspace?.name ?? null,
      workspaceHref: hrefs.workspaceHref,
      integrationHealthHref: hrefs.integrationHealthHref,
      processingErrorPreview: preview.text === "—" ? null : preview.text,
      processingErrorRedacted: preview.redacted,
    };
  });
}

export async function listPlatformWebhookDlqItems(
  take: number,
): Promise<PlatformWebhookDlqRow[]> {
  const recoveryRows = await prisma.errorRecoveryItem.findMany({
    where: {
      source: ErrorRecoverySource.WEBHOOK_JOB,
      status: ErrorRecoveryItemStatus.OPEN,
    },
    orderBy: { updatedAt: "desc" },
    take,
    select: {
      id: true,
      workspaceId: true,
      userId: true,
      provider: true,
      eventType: true,
      webhookEventId: true,
      webhookJobId: true,
      suggestedAction: true,
      safeRetryHref: true,
      lastError: true,
      attempts: true,
      maxAttempts: true,
      updatedAt: true,
      workspace: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const missingWorkspaceOwnerIds = [
    ...new Set(
      recoveryRows
        .filter((row) => row.workspace == null)
        .map((row) => row.userId),
    ),
  ];

  const fallbackWorkspaces =
    missingWorkspaceOwnerIds.length === 0
      ? []
      : await prisma.workspace.findMany({
          where: { ownerUserId: { in: missingWorkspaceOwnerIds } },
          select: {
            id: true,
            name: true,
            ownerUserId: true,
          },
        });

  const fallbackWorkspaceByOwnerId = new Map(
    fallbackWorkspaces.map((workspace) => [workspace.ownerUserId, workspace] as const),
  );

  const webhookJobIds = [
    ...new Set(
      recoveryRows
        .map((row) => row.webhookJobId)
        .filter((value): value is string => Boolean(value)),
    ),
  ];
  const webhookEventIds = [
    ...new Set(
      recoveryRows
        .map((row) => row.webhookEventId)
        .filter((value): value is string => Boolean(value)),
    ),
  ];

  const [jobs, events] = await Promise.all([
    webhookJobIds.length === 0
      ? Promise.resolve([])
      : prisma.webhookProcessingJob.findMany({
          where: { id: { in: webhookJobIds } },
          select: {
            id: true,
            status: true,
            lastError: true,
            nextAttemptAt: true,
          },
        }),
    webhookEventIds.length === 0
      ? Promise.resolve([])
      : prisma.webhookEvent.findMany({
          where: { id: { in: webhookEventIds } },
          select: {
            id: true,
            topic: true,
            receivedAt: true,
            signatureValid: true,
            processed: true,
            processingError: true,
          },
        }),
  ]);

  const jobById = new Map(jobs.map((job) => [job.id, job] as const));
  const eventById = new Map(events.map((event) => [event.id, event] as const));

  return recoveryRows.map((row) => {
    const workspace =
      row.workspace ??
      fallbackWorkspaceByOwnerId.get(row.userId) ??
      null;
    const hrefs = hrefsForWorkspace(workspace?.id ?? row.workspaceId ?? null);
    const job = row.webhookJobId ? jobById.get(row.webhookJobId) ?? null : null;
    const event = row.webhookEventId ? eventById.get(row.webhookEventId) ?? null : null;
    const preview = toSafeErrorPreview(
      row.lastError ?? job?.lastError ?? event?.processingError ?? null,
      160,
    );

    return {
      id: row.id,
      workspaceId: workspace?.id ?? row.workspaceId ?? null,
      workspaceName: workspace?.name ?? null,
      workspaceHref: hrefs.workspaceHref,
      integrationHealthHref: hrefs.integrationHealthHref,
      provider: row.provider ? String(row.provider) : null,
      eventType: row.eventType ?? event?.topic ?? null,
      updatedAt: row.updatedAt,
      attempts: row.attempts ?? null,
      maxAttempts: row.maxAttempts ?? null,
      webhookEventId: row.webhookEventId ?? null,
      webhookJobId: row.webhookJobId ?? null,
      suggestedAction: row.suggestedAction ?? null,
      safeRetryHref: row.safeRetryHref ?? null,
      jobStatus: job?.status ?? null,
      nextAttemptAt: job?.nextAttemptAt ?? null,
      signatureValid: event?.signatureValid ?? null,
      receivedAt: event?.receivedAt ?? null,
      processed: event?.processed ?? null,
      lastErrorPreview: preview.text === "—" ? null : preview.text,
      lastErrorRedacted: preview.redacted,
    };
  });
}
