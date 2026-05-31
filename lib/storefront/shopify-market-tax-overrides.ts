import { IntegrationProvider } from "@prisma/client";

import { isShopifyMarketsTaxGuardEnabled } from "@/lib/commercial/shopify-market-tax-guard";
import {
  parseShopifyMarketsSyncSettings,
  type ShopifyMarketTaxImportRow,
} from "@/lib/integrations/shopify-markets-settings";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import type { StorefrontMarket } from "@/lib/storefront/markets";
import { prisma } from "@/lib/prisma";

export type ShopifyMarketTaxOverlay = {
  /** Reference-only Shopify tax hints — checkout always uses KitchenOS tax engine */
  source: "kitchenos" | "shopify_reference";
  importRow: ShopifyMarketTaxImportRow | null;
};

export async function loadShopifyMarketTaxOverlayForMarket(input: {
  ownerUserId: string;
  market: StorefrontMarket;
}): Promise<ShopifyMarketTaxOverlay> {
  if (!isShopifyMarketsTaxGuardEnabled()) {
    return { source: "kitchenos", importRow: null };
  }

  if (input.market.syncMode !== "import" && input.market.syncMode !== "bidirectional") {
    return { source: "kitchenos", importRow: null };
  }
  if (!input.market.shopifyMarketId?.trim()) {
    return { source: "kitchenos", importRow: null };
  }

  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByProviderWhereForOwner(
      input.ownerUserId,
      IntegrationProvider.SHOPIFY,
    ),
    select: { settingsJson: true },
  });
  if (!conn) return { source: "kitchenos", importRow: null };

  const sync = parseShopifyMarketsSyncSettings(conn.settingsJson);
  const importRow = sync.marketTaxImports?.[input.market.id] ?? null;

  return {
    source: importRow ? "shopify_reference" : "kitchenos",
    importRow,
  };
}
