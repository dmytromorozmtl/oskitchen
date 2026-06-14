import { IntegrationProvider, WebhookProcessingJobStatus } from "@prisma/client";

import { markWebhookProcessed } from "@/lib/webhooks/webhook-event-store";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { captureErrorSafe } from "@/services/observability/error-reporting-service";
import {
  resolveWebhookJobRecoveryItemIfExists,
  upsertWebhookJobFailureRecoveryItem,
} from "@/services/webhooks/webhook-error-recovery-service";

import { executeInboundWebhookByProvider } from "./webhook-provider-router";
import { webhookRetryDelayMs } from "./webhook-retry-service";

const STALE_LOCK_MS = 5 * 60 * 1000;

async function workspaceIdForOwner(userId: string): Promise<string | null> {
  const w = await prisma.workspace.findFirst({
    where: { ownerUserId: userId },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  return w?.id ?? null;
}

async function recordTerminalWebhookFailure(
  job: {
    id: string;
    userId: string;
    provider: IntegrationProvider;
    attemptCount: number;
    maxAttempts: number;
    webhookEventId: string;
    webhookEvent: { topic: string };
  },
  lastError: string,
): Promise<void> {
  const workspaceId = await workspaceIdForOwner(job.userId);
  await upsertWebhookJobFailureRecoveryItem({
    jobId: job.id,
    userId: job.userId,
    workspaceId,
    provider: job.provider,
    eventType: job.webhookEvent.topic,
    webhookEventId: job.webhookEventId,
    lastError: lastError,
    attempts: job.attemptCount,
    maxAttempts: job.maxAttempts,
  });
  captureErrorSafe(new Error(lastError), {
    module: "webhook_job",
    jobId: job.id,
    provider: String(job.provider),
  });
}

/**
 * Drain a batch of queued webhook jobs. Intended for `/api/cron/webhook-jobs`.
 * WooCommerce + Shopify are supported through the async queue. Production always
 * expects this worker path to be available.
 */
export async function runWebhookJobBatch(maxJobs: number): Promise<{
  attempted: number;
  succeeded: number;
  failed: number;
  rescheduled: number;
  skipped: number;
}> {
  const now = new Date();
  const staleBefore = new Date(Date.now() - STALE_LOCK_MS);
  let attempted = 0;
  let succeeded = 0;
  let failed = 0;
  let rescheduled = 0;
  let skipped = 0;

  for (let i = 0; i < maxJobs; i++) {
    const candidate = await prisma.webhookProcessingJob.findFirst({
      where: {
        OR: [
          { status: WebhookProcessingJobStatus.QUEUED },
          {
            status: WebhookProcessingJobStatus.RETRYING,
            OR: [{ nextAttemptAt: null }, { nextAttemptAt: { lte: now } }],
          },
        ],
        AND: [
          {
            OR: [{ lockedAt: null }, { lockedAt: { lt: staleBefore } }],
          },
        ],
      },
      orderBy: { createdAt: "asc" },
      include: { webhookEvent: true },
    });

    if (!candidate) break;

    const lock = await prisma.webhookProcessingJob.updateMany({
      where: {
        id: candidate.id,
        status: { in: [WebhookProcessingJobStatus.QUEUED, WebhookProcessingJobStatus.RETRYING] },
      },
      data: {
        status: WebhookProcessingJobStatus.PROCESSING,
        lockedAt: now,
        attemptCount: { increment: 1 },
      },
    });

    if (lock.count !== 1) {
      skipped++;
      continue;
    }

    const job = await prisma.webhookProcessingJob.findUnique({
      where: { id: candidate.id },
      include: { webhookEvent: true },
    });
    if (!job?.webhookEvent?.connectionId) {
      await prisma.webhookProcessingJob.update({
        where: { id: candidate.id },
        data: {
          status: WebhookProcessingJobStatus.FAILED,
          lastError: "Missing connection on webhook event",
          lockedAt: null,
        },
      });
      await markWebhookProcessed(candidate.webhookEventId, false, "Missing connection");
      failed++;
      attempted++;
      if (job?.webhookEvent) {
        await recordTerminalWebhookFailure(
          {
            id: job.id,
            userId: job.userId,
            provider: job.provider,
            attemptCount: job.attemptCount,
            maxAttempts: job.maxAttempts,
            webhookEventId: job.webhookEventId,
            webhookEvent: { topic: job.webhookEvent.topic },
          },
          "Missing connection on webhook event",
        );
      }
      continue;
    }

    attempted++;

    try {
      if (!job.webhookEvent.signatureValid) {
        await prisma.webhookProcessingJob.update({
          where: { id: job.id },
          data: { status: WebhookProcessingJobStatus.SIGNATURE_FAILED, lockedAt: null },
        });
        await markWebhookProcessed(job.webhookEventId, false, "Invalid signature");
        failed++;
        continue;
      }

      await executeInboundWebhookByProvider({
        provider: job.provider,
        userId: job.userId,
        connectionId: job.webhookEvent.connectionId,
        webhookEventId: job.webhookEventId,
        topic: job.webhookEvent.topic,
        payload: job.webhookEvent.payloadJson,
      });

      await markWebhookProcessed(job.webhookEventId, true);
      await prisma.webhookProcessingJob.update({
        where: { id: job.id },
        data: { status: WebhookProcessingJobStatus.PROCESSED, lockedAt: null, lastError: null },
      });
      await resolveWebhookJobRecoveryItemIfExists(job.id);
      succeeded++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const isUnsupported = msg.includes("No inbound webhook router");
      if (isUnsupported) {
        await prisma.webhookProcessingJob.update({
          where: { id: job.id },
          data: {
            status: WebhookProcessingJobStatus.UNSUPPORTED,
            lastError: msg,
            lockedAt: null,
          },
        });
        await markWebhookProcessed(job.webhookEventId, false, msg);
        failed++;
        continue;
      }

      logger.warn("webhook_job_failed", { jobId: job.id, err: msg });

      const attempts = job.attemptCount;
      if (attempts >= job.maxAttempts) {
        await prisma.webhookProcessingJob.update({
          where: { id: job.id },
          data: { status: WebhookProcessingJobStatus.FAILED, lastError: msg, lockedAt: null },
        });
        await markWebhookProcessed(job.webhookEventId, false, msg);
        failed++;
        await recordTerminalWebhookFailure(
          {
            id: job.id,
            userId: job.userId,
            provider: job.provider,
            attemptCount: job.attemptCount,
            maxAttempts: job.maxAttempts,
            webhookEventId: job.webhookEventId,
            webhookEvent: { topic: job.webhookEvent.topic },
          },
          msg,
        );
      } else {
        const delay = webhookRetryDelayMs(attempts);
        await prisma.webhookProcessingJob.update({
          where: { id: job.id },
          data: {
            status: WebhookProcessingJobStatus.RETRYING,
            lastError: msg,
            lockedAt: null,
            nextAttemptAt: new Date(Date.now() + delay),
          },
        });
        rescheduled++;
      }
    }
  }

  return { attempted, succeeded, failed, rescheduled, skipped };
}
