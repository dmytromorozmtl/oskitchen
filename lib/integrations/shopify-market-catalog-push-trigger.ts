import { IntegrationProvider } from "@prisma/client";

import { getShopifyCredentials } from "@/lib/integrations/decrypt-connection";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import {
  hasCatalogSyncShopifyMarkets,
  reconcileBidirectionalShopifyMarketCatalogForConnection,
} from "@/services/integrations/shopify-markets-catalog-bidirectional-service";
import {
  listCatalogPushableStorefrontMarkets,
  pushShopifyMarketCatalogForConnection,
} from "@/services/integrations/shopify-market-catalog-push-service";
import { listBidirectionalStorefrontMarkets } from "@/services/integrations/shopify-market-prices-push-service";

/**
 * Best-effort catalog publication push after OS Kitchen market menu changes.
 * Debounced per connection; failures are logged and never block market saves.
 */
export async function triggerShopifyMarketCatalogPushAfterMarketsUpdate(input: {
  userId: string;
}): Promise<void> {
  try {
    const kitchen = await prisma.kitchenSettings.findUnique({
      where: { userId: input.userId },
      select: { settingsCenterJson: true },
    });
    if (!hasCatalogSyncShopifyMarkets(kitchen?.settingsCenterJson)) return;

    const hasPush = listCatalogPushableStorefrontMarkets(kitchen?.settingsCenterJson).length > 0;
    const hasBidirectional =
      listBidirectionalStorefrontMarkets(kitchen?.settingsCenterJson).length > 0;
    if (!hasPush && !hasBidirectional) return;

    const conn = await prisma.integrationConnection.findFirst({
      where: await integrationConnectionByProviderWhereForOwner(
        input.userId,
        IntegrationProvider.SHOPIFY,
      ),
    });
    if (!conn) return;

    const creds = getShopifyCredentials(conn);
    if (!creds) return;

    if (hasBidirectional) {
      await reconcileBidirectionalShopifyMarketCatalogForConnection({
        userId: input.userId,
        connection: conn,
        creds,
        origin: "markets_update",
        skipUnchanged: true,
      });
      return;
    }

    await pushShopifyMarketCatalogForConnection({
      userId: input.userId,
      connection: conn,
      creds,
      skipUnchanged: true,
      respectDebounce: true,
    });
  } catch (error) {
    console.error("shopify_market_catalog_push_trigger_failed", error);
  }
}

/**
 * Best-effort catalog publication push after KitchenOS product visibility changes.
 * Only runs when the product is mapped to Shopify and catalog sync is enabled.
 */
export async function triggerShopifyMarketCatalogPushAfterProductUpdate(input: {
  userId: string;
  productId: string;
  previousActive?: boolean | null;
  newActive: boolean;
}): Promise<void> {
  if (input.previousActive != null && input.previousActive === input.newActive) return;

  try {
    const kitchen = await prisma.kitchenSettings.findUnique({
      where: { userId: input.userId },
      select: { settingsCenterJson: true },
    });
    if (!hasCatalogSyncShopifyMarkets(kitchen?.settingsCenterJson)) return;

    const hasPush = listCatalogPushableStorefrontMarkets(kitchen?.settingsCenterJson).length > 0;
    const hasBidirectional =
      listBidirectionalStorefrontMarkets(kitchen?.settingsCenterJson).length > 0;
    if (!hasPush && !hasBidirectional) return;

    const conn = await prisma.integrationConnection.findFirst({
      where: await integrationConnectionByProviderWhereForOwner(
        input.userId,
        IntegrationProvider.SHOPIFY,
      ),
    });
    if (!conn) return;

    const mapped = await prisma.externalProduct.findFirst({
      where: {
        connectionId: conn.id,
        mappedProductId: input.productId,
      },
      select: { id: true },
    });
    if (!mapped) return;

    const creds = getShopifyCredentials(conn);
    if (!creds) return;

    if (hasBidirectional) {
      await reconcileBidirectionalShopifyMarketCatalogForConnection({
        userId: input.userId,
        connection: conn,
        creds,
        origin: "product_update",
        skipUnchanged: true,
      });
      return;
    }

    await pushShopifyMarketCatalogForConnection({
      userId: input.userId,
      connection: conn,
      creds,
      productIds: [input.productId],
      skipUnchanged: true,
      respectDebounce: true,
    });
  } catch (error) {
    console.error("shopify_market_catalog_push_trigger_failed", error);
  }
}
