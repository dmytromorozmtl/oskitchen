import { IntegrationProvider } from "@prisma/client";

import {
  parseShopifyMarketsSyncSettings,
  type ShopifyMarketCatalogImportRow,
} from "@/lib/integrations/shopify-markets-settings";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import type { StorefrontMarket } from "@/lib/storefront/markets";
import { prisma } from "@/lib/prisma";
import { effectiveCatalogProductIdsForMarket } from "@/services/integrations/shopify-market-catalog-service";

export async function loadShopifyMarketCatalogOverlayForMarket(input: {
  ownerUserId: string;
  market: StorefrontMarket;
}): Promise<{ productIds: string[] | null; importRow: ShopifyMarketCatalogImportRow | null }> {
  if (
    input.market.syncMode !== "import" &&
    input.market.syncMode !== "bidirectional"
  ) {
    return { productIds: null, importRow: null };
  }
  if (!input.market.shopifyMarketId?.trim()) {
    return { productIds: null, importRow: null };
  }

  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByProviderWhereForOwner(
      input.ownerUserId,
      IntegrationProvider.SHOPIFY,
    ),
    select: { settingsJson: true },
  });
  if (!conn) return { productIds: null, importRow: null };

  const sync = parseShopifyMarketsSyncSettings(conn.settingsJson);
  const importRow = sync.marketCatalogImports?.[input.market.id] ?? null;
  const effective = effectiveCatalogProductIdsForMarket({
    market: input.market,
    catalogImportRow: importRow,
  });

  return {
    productIds: effective,
    importRow,
  };
}
