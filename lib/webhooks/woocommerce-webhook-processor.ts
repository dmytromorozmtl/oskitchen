import { persistNormalizedExternalOrder } from "@/lib/integrations/persist-external-order";
import { upsertExternalProductRecord } from "@/lib/integrations/persist-external-product";
import { stageWebhookOrderIngest } from "@/lib/channels/import-staging";
import { prisma } from "@/lib/prisma";
import {
  normalizeWooOrder,
  normalizeWooProduct,
} from "@/services/integrations/woocommerce";
import { IntegrationProvider, Prisma } from "@prisma/client";

/**
 * WooCommerce webhook business logic after persistence + signature verification.
 * Used by the HTTP handler (inline mode) and by {@link services/webhooks/webhook-job-runner}.
 */
export async function executeWooCommerceWebhookBusinessLogic(params: {
  userId: string;
  connectionId: string;
  webhookEventId: string;
  topic: string;
  payload: unknown;
}): Promise<void> {
  const row = params.payload as Record<string, unknown>;

  if (params.topic.startsWith("order.")) {
    const normalized = normalizeWooOrder(row);
    await persistNormalizedExternalOrder({
      userId: params.userId,
      connectionId: params.connectionId,
      normalized,
    });
    try {
      await stageWebhookOrderIngest({
        userId: params.userId,
        connectionId: params.connectionId,
        provider: IntegrationProvider.WOOCOMMERCE,
        webhookEventId: params.webhookEventId,
        rawPayload: params.payload,
        normalized,
      });
    } catch (stageErr) {
      console.error("channel_staging_failed", stageErr);
    }
  }

  if (params.topic.startsWith("product.")) {
    const p = normalizeWooProduct(row);
    const priceDec = p.price != null ? new Prisma.Decimal(String(p.price)) : null;
    await upsertExternalProductRecord({
      userId: params.userId,
      connectionId: params.connectionId,
      provider: IntegrationProvider.WOOCOMMERCE,
      externalProductId: p.externalProductId,
      externalVariantId: p.externalVariantId,
      title: p.title,
      sku: p.sku,
      price: priceDec,
      image: p.image,
      rawPayloadJson: p.rawPayloadJson,
    });
  }

  await prisma.integrationConnection.update({
    where: { id: params.connectionId },
    data: { lastError: null },
  });
}
