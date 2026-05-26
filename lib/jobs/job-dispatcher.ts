import { IntegrationProvider, type Prisma } from "@prisma/client";

import { isWebhookAsyncQueueEnabled } from "@/lib/webhooks/webhook-queue-mode";
import { getWebhookJobMaxAttempts } from "@/lib/webhooks/webhook-job-config";
import { BACKGROUND_JOB_EVENT, inngest } from "@/lib/inngest/client";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export type BackgroundJobKind =
  | "EMAIL_NOTIFICATION"
  | "WEBHOOK_FANOUT"
  | "PDF_GENERATION"
  | "ROUTE_OPTIMIZATION";

export type EnqueueJobInput = {
  userId: string;
  workspaceId?: string | null;
  kind: BackgroundJobKind;
  payload: Record<string, unknown>;
};

/**
 * Dispatch async work via DB webhook job queue when `WEBHOOK_ASYNC_QUEUE=true`.
 * Cron `/api/cron/webhook-jobs` drains jobs. Inngest/Trigger.dev can replace this adapter.
 */
export async function dispatchBackgroundJob(input: EnqueueJobInput): Promise<{ mode: "queued" | "inline" | "inngest" }> {
  if (process.env.INNGEST_EVENT_KEY) {
    try {
      await inngest.send({
        name: BACKGROUND_JOB_EVENT,
        data: input,
      });
      return { mode: "inngest" };
    } catch (e) {
      logger.warn("[jobs] Inngest send failed — falling back to DB queue", e);
    }
  }

  if (!isWebhookAsyncQueueEnabled()) {
    logger.debug("[jobs] inline dispatch (pilot mode)", input.kind);
    return { mode: "inline" };
  }

  const event = await prisma.webhookEvent.create({
    data: {
      userId: input.userId,
      workspaceId: input.workspaceId ?? null,
      provider: IntegrationProvider.MANUAL,
      topic: input.kind,
      payloadJson: input.payload as Prisma.InputJsonValue,
      signatureValid: true,
      processed: false,
    },
  });

  await prisma.webhookProcessingJob.create({
    data: {
      webhookEventId: event.id,
      userId: input.userId,
      provider: IntegrationProvider.MANUAL,
      maxAttempts: getWebhookJobMaxAttempts(),
    },
  });

  return { mode: "queued" };
}
