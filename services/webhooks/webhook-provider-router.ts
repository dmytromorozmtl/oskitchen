import { IntegrationProvider } from "@prisma/client";

import { executeShopifyWebhookBusinessLogic } from "@/lib/webhooks/shopify-webhook-processor";
import { executeWooCommerceWebhookBusinessLogic } from "@/lib/webhooks/woocommerce-webhook-processor";

export async function executeInboundWebhookByProvider(params: {
  provider: IntegrationProvider;
  userId: string;
  connectionId: string;
  webhookEventId: string;
  topic: string;
  payload: unknown;
}): Promise<void> {
  switch (params.provider) {
    case IntegrationProvider.WOOCOMMERCE:
      await executeWooCommerceWebhookBusinessLogic({
        userId: params.userId,
        connectionId: params.connectionId,
        webhookEventId: params.webhookEventId,
        topic: params.topic,
        payload: params.payload,
      });
      return;
    case IntegrationProvider.SHOPIFY:
      await executeShopifyWebhookBusinessLogic({
        userId: params.userId,
        connectionId: params.connectionId,
        webhookEventId: params.webhookEventId,
        topic: params.topic,
        payload: params.payload,
      });
      return;
    default:
      throw new Error(`No inbound webhook router for ${params.provider}`);
  }
}
