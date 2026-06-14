import {
  IntegrationProvider,
  KitchenTaskSource,
  KitchenTaskStatus,
  KitchenTaskType,
} from "@prisma/client";
import type { PrismaClient } from "@prisma/client";

import {
  createWebhookEvent,
  markWebhookProcessed,
} from "@/lib/webhooks/webhook-event-store";
import { executeShopifyWebhookBusinessLogic } from "@/lib/webhooks/shopify-webhook-processor";

export {
  waitForWebhookEvent,
  waitForKitchenTaskForOrder,
  simulateKdsBump,
  waitForKdsBumpState,
} from "@/services/integrations/woocommerce-webhook-kds-smoke";

/** Smoke-only ingest — mirrors `/api/webhooks/shopify/*` inline path after HMAC verify. */
export async function ingestShopifyWebhookForSmoke(input: {
  userId: string;
  workspaceId?: string | null;
  connectionId: string;
  topic: string;
  payload: Record<string, unknown>;
  webhookId: string;
}): Promise<{ webhookEventId: string; duplicate: boolean }> {
  const { duplicate, id } = await createWebhookEvent({
    userId: input.userId,
    workspaceId: input.workspaceId,
    connectionId: input.connectionId,
    provider: IntegrationProvider.SHOPIFY,
    topic: input.topic,
    payload: input.payload,
    signatureValid: true,
    externalEventId: input.webhookId,
  });

  if (!duplicate) {
    await executeShopifyWebhookBusinessLogic({
      userId: input.userId,
      connectionId: input.connectionId,
      webhookEventId: id,
      topic: input.topic,
      payload: input.payload,
    });
    await markWebhookProcessed(id, true);
  }

  return { webhookEventId: id, duplicate };
}

/** Creates a SALES_CHANNEL prep task when channel import does not auto-provision KitchenTask rows. */
export async function ensureKitchenTaskForShopifyKdsSmoke(input: {
  prisma: PrismaClient;
  userId: string;
  workspaceId?: string | null;
  orderId: string;
  externalOrderId: string;
}): Promise<{ ok: boolean; taskId: string; created: boolean }> {
  const existing = await input.prisma.kitchenTask.findFirst({
    where: { relatedOrderId: input.orderId },
    select: { id: true },
    orderBy: { createdAt: "desc" },
  });
  if (existing) {
    return { ok: true, taskId: existing.id, created: false };
  }

  const row = await input.prisma.kitchenTask.create({
    data: {
      userId: input.userId,
      workspaceId: input.workspaceId ?? undefined,
      title: `Shopify order ${input.externalOrderId}`,
      taskType: KitchenTaskType.PREP,
      sourceType: KitchenTaskSource.SALES_CHANNEL,
      sourceLabel: "shopify-smoke",
      relatedOrderId: input.orderId,
      status: KitchenTaskStatus.OPEN,
      metadataJson: {
        smoke: true,
        externalOrderId: input.externalOrderId,
        provider: "shopify",
      },
    },
    select: { id: true },
  });

  return { ok: true, taskId: row.id, created: true };
}
