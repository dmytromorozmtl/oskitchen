import {
  IntegrationProvider,
  IntegrationStatus,
  Prisma,
} from "@prisma/client";

import { persistNormalizedExternalOrder } from "@/lib/integrations/persist-external-order";
import { upsertExternalProductRecord } from "@/lib/integrations/persist-external-product";
import { prisma } from "@/lib/prisma";
import { integrationConnectionByIdWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { stageWebhookOrderIngest } from "@/lib/channels/import-staging";
import {
  handleShopifyMarketsWebhookEvent,
} from "@/lib/webhooks/shopify-markets-webhook-service";
import { touchShopifyMarketsWebhookDelivery } from "@/services/integrations/shopify-markets-webhook-registry-service";
import { importShopifyOrderToKitchen } from "@/services/integrations/shopify/kitchen-import.service";
import { syncShopifyInventoryFromOrder } from "@/services/integrations/shopify/inventory-sync.service";
import { normalizeShopifyRestOrder } from "@/services/integrations/shopify";

/**
 * Shopify webhook business logic after persistence + HMAC verification.
 * Used by the HTTP handler (inline mode) and by {@link services/webhooks/webhook-job-runner}.
 */
export async function executeShopifyWebhookBusinessLogic(params: {
  userId: string;
  connectionId: string;
  webhookEventId: string;
  topic: string;
  payload: unknown;
}): Promise<void> {
  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByIdWhereForOwner(params.userId, params.connectionId),
  });
  if (!conn) {
    throw new Error("Shopify connection not found for webhook processing");
  }

  if (params.topic === "app/uninstalled") {
    await prisma.integrationConnection.update({
      where: { id: conn.id },
      data: {
        status: IntegrationStatus.NEEDS_AUTH,
        lastError: "Shopify app uninstalled",
      },
    });
    return;
  }

  if (
    params.topic === "markets/create" ||
    params.topic === "markets/update" ||
    params.topic === "markets/delete"
  ) {
    await handleShopifyMarketsWebhookEvent({
      userId: params.userId,
      connection: conn,
      topic: params.topic,
    });
    await touchShopifyMarketsWebhookDelivery({
      connectionId: conn.id,
      topic: params.topic,
    });
    await prisma.integrationConnection.update({
      where: { id: conn.id },
      data: { lastError: null },
    });
    return;
  }

  if (params.topic === "orders/create" || params.topic === "orders/updated") {
    const order = params.payload as Record<string, unknown>;
    const normalized = normalizeShopifyRestOrder(order);
    const external = await persistNormalizedExternalOrder({
      userId: params.userId,
      connectionId: conn.id,
      normalized,
    });

    await importShopifyOrderToKitchen({
      userId: params.userId,
      workspaceId: conn.workspaceId,
      connectionId: conn.id,
      normalized,
      externalOrderRecordId: external.id,
    }).catch((err) => {
      console.error("shopify_kitchen_import_failed", err);
    });

    if (params.topic === "orders/create") {
      await syncShopifyInventoryFromOrder({
        userId: params.userId,
        connectionId: conn.id,
        normalized,
        rawPayload: params.payload,
      }).catch((err) => {
        console.error("shopify_inventory_sync_failed", err);
      });
    }

    try {
      await stageWebhookOrderIngest({
        userId: params.userId,
        connectionId: conn.id,
        provider: IntegrationProvider.SHOPIFY,
        webhookEventId: params.webhookEventId,
        rawPayload: params.payload,
        normalized,
      });
    } catch (stageErr) {
      console.error("channel_staging_failed", stageErr);
    }
    await prisma.integrationConnection.update({
      where: { id: conn.id },
      data: { lastError: null },
    });
    return;
  }

  if (params.topic === "products/update") {
    const product = params.payload as Record<string, unknown>;
    const pid = String(product.id ?? "");
    const title = String(product.title ?? "Product");
    const variants =
      (product.variants as Record<string, unknown>[] | undefined) ?? [];
    const imageUrl =
      (product.image as { src?: string } | undefined)?.src ??
      (product.images as { src?: string }[] | undefined)?.[0]?.src ??
      null;

    if (variants.length === 0) {
      await upsertExternalProductRecord({
        userId: params.userId,
        connectionId: conn.id,
        provider: IntegrationProvider.SHOPIFY,
        externalProductId: pid,
        externalVariantId: "",
        title,
        sku: null,
        price: null,
        image: imageUrl,
        rawPayloadJson: product,
      });
    } else {
      for (const v of variants) {
        const vid = String(v.id ?? "");
        const sku = v.sku != null ? String(v.sku) : null;
        const price =
          v.price != null ? new Prisma.Decimal(String(v.price)) : null;
        await upsertExternalProductRecord({
          userId: params.userId,
          connectionId: conn.id,
          provider: IntegrationProvider.SHOPIFY,
          externalProductId: pid,
          externalVariantId: vid,
          title: `${title} — ${String(v.title ?? "Default")}`,
          sku,
          price,
          image: imageUrl,
          rawPayloadJson: { product, variant: v },
        });
      }
    }
    await handleShopifyMarketsWebhookEvent({
      userId: params.userId,
      connection: conn,
      topic: params.topic,
    });
    await touchShopifyMarketsWebhookDelivery({
      connectionId: conn.id,
      topic: params.topic,
    });
    await prisma.integrationConnection.update({
      where: { id: conn.id },
      data: { lastError: null },
    });
    return;
  }

  await prisma.integrationConnection.update({
    where: { id: conn.id },
    data: { lastError: null },
  });
}

