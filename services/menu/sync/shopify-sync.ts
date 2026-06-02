import { IntegrationProvider } from "@prisma/client";

import {
  connectionErrorMessage,
  loadIntegrationConnection,
  runChannelMenuSyncJob,
} from "@/lib/menu/channel-sync-helpers";
import type { ChannelMenuSyncInput, ChannelMenuSyncResult } from "@/lib/menu/channel-sync-types";
import { toSyncResult } from "@/lib/menu/channel-sync-types";
import { triggerShopifyMarketCatalogPushAfterProductUpdate } from "@/lib/integrations/shopify-market-catalog-push-trigger";
import { prisma } from "@/lib/prisma";

/** Push a single mapped product to Shopify via existing catalog sync pipeline. */
export async function syncMenuItemToShopify(
  input: ChannelMenuSyncInput,
): Promise<ChannelMenuSyncResult> {
  const { userId, productId, effective, previousMaster } = input;
  const conn = await loadIntegrationConnection(userId, IntegrationProvider.SHOPIFY);

  if (!conn.connected) {
    return toSyncResult(
      false,
      conn.status ? "error" : "disconnected",
      connectionErrorMessage("Shopify", conn.status),
    );
  }

  if (!effective.enabled) {
    await runChannelMenuSyncJob({
      userId,
      connectionId: conn.id,
      provider: IntegrationProvider.SHOPIFY,
      run: async () => {
        await triggerShopifyMarketCatalogPushAfterProductUpdate({
          userId,
          productId,
          previousActive: previousMaster.active,
          newActive: false,
        });
        return { ok: true, message: "Shopify visibility suppressed." };
      },
    });
    return toSyncResult(true, "synced", "Shopify visibility suppressed.");
  }

  const mapped = await prisma.externalProduct.findFirst({
    where: {
      userId,
      provider: IntegrationProvider.SHOPIFY,
      mappedProductId: productId,
    },
    select: { id: true },
  });

  if (!mapped) {
    return toSyncResult(
      false,
      "pending",
      "Product not mapped to Shopify — import or map before sync.",
    );
  }

  const outcome = await runChannelMenuSyncJob({
    userId,
    connectionId: conn.id,
    provider: IntegrationProvider.SHOPIFY,
    run: async () => {
      await triggerShopifyMarketCatalogPushAfterProductUpdate({
        userId,
        productId,
        previousActive: previousMaster.active,
        newActive: true,
      });
      return { ok: true, message: "Shopify catalog push triggered." };
    },
  });

  return toSyncResult(outcome.ok, outcome.ok ? "synced" : "error", outcome.message);
}
