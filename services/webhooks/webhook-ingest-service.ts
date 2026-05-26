import { IntegrationProvider } from "@prisma/client";

import { getWebhookJobMaxAttempts } from "@/lib/webhooks/webhook-job-config";
import { prisma } from "@/lib/prisma";

/** Enqueue async processing for WooCommerce after `WebhookEvent` row exists. */
export async function enqueueWooCommerceWebhookJob(params: {
  webhookEventId: string;
  userId: string;
}): Promise<void> {
  await prisma.webhookProcessingJob.create({
    data: {
      webhookEventId: params.webhookEventId,
      userId: params.userId,
      provider: IntegrationProvider.WOOCOMMERCE,
      maxAttempts: getWebhookJobMaxAttempts(),
    },
  });
}

/** Enqueue async processing for Shopify after `WebhookEvent` row exists. */
export async function enqueueShopifyWebhookJob(params: {
  webhookEventId: string;
  userId: string;
}): Promise<void> {
  await prisma.webhookProcessingJob.create({
    data: {
      webhookEventId: params.webhookEventId,
      userId: params.userId,
      provider: IntegrationProvider.SHOPIFY,
      maxAttempts: getWebhookJobMaxAttempts(),
    },
  });
}
