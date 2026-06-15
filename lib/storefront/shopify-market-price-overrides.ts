import { IntegrationProvider } from "@prisma/client";

import {
  parseShopifyMarketsSyncSettings,
  type ShopifyMarketPriceImportRow,
} from "@/lib/integrations/shopify-markets-settings";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import type { StorefrontMarket } from "@/lib/storefront/markets";
import { prisma } from "@/lib/prisma";
import { productPriceOverridesFromImportRow } from "@/services/integrations/shopify-market-prices-service";

export async function loadShopifyMarketPriceOverridesForMarket(input: {
  ownerUserId: string;
  market: StorefrontMarket;
}): Promise<{ overrides: Map<string, number>; importRow: ShopifyMarketPriceImportRow | null }> {
  if (input.market.syncMode !== "import" || !input.market.shopifyMarketId?.trim()) {
    return { overrides: new Map(), importRow: null };
  }

  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByProviderWhereForOwner(
      input.ownerUserId,
      IntegrationProvider.SHOPIFY,
    ),
    select: { settingsJson: true },
  });
  if (!conn) return { overrides: new Map(), importRow: null };

  const sync = parseShopifyMarketsSyncSettings(conn.settingsJson);
  const importRow = sync.marketPriceImports?.[input.market.id] ?? null;
  return {
    overrides: productPriceOverridesFromImportRow(importRow),
    importRow,
  };
}
