import { IntegrationProvider, type Prisma } from "@prisma/client";

import { BACKGROUND_JOB_EVENT, inngest } from "@/lib/inngest/client";
import { getWebhookJobMaxAttempts } from "@/lib/webhooks/webhook-job-config";
import { prisma } from "@/lib/prisma";
import type { BackgroundJobKind } from "@/lib/jobs/job-dispatcher";

type JobPayload = {
  userId: string;
  workspaceId?: string | null;
  kind: BackgroundJobKind;
  payload: Record<string, unknown>;
};

export const processBackgroundJob = inngest.createFunction(
  { id: "process-background-job", retries: 3 },
  { event: BACKGROUND_JOB_EVENT },
  async (ctx: { event: { data: unknown } }) => {
    const data = ctx.event.data as JobPayload;

    const webhookEvent = await prisma.webhookEvent.create({
      data: {
        userId: data.userId,
        workspaceId: data.workspaceId ?? null,
        provider: IntegrationProvider.MANUAL,
        topic: data.kind,
        payloadJson: data.payload as Prisma.InputJsonValue,
        signatureValid: true,
        processed: false,
      },
    });

    await prisma.webhookProcessingJob.create({
      data: {
        webhookEventId: webhookEvent.id,
        userId: data.userId,
        provider: IntegrationProvider.MANUAL,
        maxAttempts: getWebhookJobMaxAttempts(),
      },
    });

    return { queued: true, webhookEventId: webhookEvent.id };
  },
);

export const inngestFunctions = [processBackgroundJob];
