import { IntegrationProvider } from "@prisma/client";

import { getShopifyCredentials } from "@/lib/integrations/decrypt-connection";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import {
  listPushableStorefrontMarkets,
  pushShopifyMarketPricesForConnection,
} from "@/services/integrations/shopify-market-prices-push-service";

/**
 * Best-effort push after KitchenOS product price changes.
 * Debounced per connection; failures are logged and never block product saves.
 */
export async function triggerShopifyMarketPricePushAfterProductUpdate(input: {
  userId: string;
  productId: string;
  previousPrice?: string | null;
  newPrice: string;
}): Promise<void> {
  if (input.previousPrice != null && input.previousPrice === input.newPrice) return;

  try {
    const kitchen = await prisma.kitchenSettings.findUnique({
      where: { userId: input.userId },
      select: { settingsCenterJson: true },
    });
    if (listPushableStorefrontMarkets(kitchen?.settingsCenterJson).length === 0) return;

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

    await pushShopifyMarketPricesForConnection({
      userId: input.userId,
      connection: conn,
      creds,
      productIds: [input.productId],
      skipUnchanged: true,
      origin: "product_update",
      respectDebounce: true,
    });
  } catch (error) {
    console.error("shopify_market_price_push_trigger_failed", error);
  }
}
