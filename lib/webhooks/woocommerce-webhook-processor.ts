import { persistNormalizedExternalOrder } from "@/lib/integrations/persist-external-order";
import { upsertExternalProductRecord } from "@/lib/integrations/persist-external-product";
import { stageWebhookOrderIngest } from "@/lib/channels/import-staging";
import { prisma } from "@/lib/prisma";
import { importWooCommerceOrderToKitchen } from "@/services/integrations/woocommerce/kitchen-import.service";
import {
  syncWooCommerceInventoryFromOrder,
  syncWooCommerceInventoryFromProductWebhook,
} from "@/services/integrations/woocommerce/inventory-sync.service";
import {
  normalizeWooOrder,
  normalizeWooProduct,
  extractWooStockQuantity,
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
  const conn = await prisma.integrationConnection.findFirst({
    where: { id: params.connectionId },
    select: { workspaceId: true },
  });

  if (params.topic.startsWith("order.")) {
    const normalized = normalizeWooOrder(row);
    const external = await persistNormalizedExternalOrder({
      userId: params.userId,
      connectionId: params.connectionId,
      normalized,
    });

    await importWooCommerceOrderToKitchen({
      userId: params.userId,
      workspaceId: conn?.workspaceId,
      connectionId: params.connectionId,
      normalized,
      externalOrderRecordId: external.id,
    }).catch((err) => {
      console.error("woocommerce_kitchen_import_failed", err);
    });

    if (params.topic === "order.created") {
      await syncWooCommerceInventoryFromOrder({
        userId: params.userId,
        connectionId: params.connectionId,
        normalized,
      }).catch((err) => {
        console.error("woocommerce_inventory_sync_failed", err);
      });
    }

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

    const stockQty = extractWooStockQuantity(row);
    if (stockQty != null) {
      await syncWooCommerceInventoryFromProductWebhook({
        userId: params.userId,
        connectionId: params.connectionId,
        externalProductId: p.externalProductId,
        stockQuantity: stockQty,
      }).catch((err) => {
        console.error("woocommerce_inbound_inventory_sync_failed", err);
      });
    }
  }

  await prisma.integrationConnection.update({
    where: { id: params.connectionId },
    data: { lastError: null },
  });
}
