import { IntegrationProvider } from "@prisma/client";

import { isShopifyMarketsHostnameGuardEnabled } from "@/lib/commercial/shopify-market-hostname-guard";
import {
  parseShopifyMarketsSyncSettings,
  type ShopifyMarketHostnameImportRow,
} from "@/lib/integrations/shopify-markets-settings";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import type { StorefrontMarket } from "@/lib/storefront/markets";
import { prisma } from "@/lib/prisma";

export type ShopifyMarketHostnameOverlay = {
  source: "kitchenos" | "shopify_reference";
  importRow: ShopifyMarketHostnameImportRow | null;
  previewUrl: string | null;
};

export async function loadShopifyMarketHostnameOverlayForMarket(input: {
  ownerUserId: string;
  market: StorefrontMarket;
  primaryStoreSlug: string;
  rootDomain?: string | null;
}): Promise<ShopifyMarketHostnameOverlay> {
  if (!isShopifyMarketsHostnameGuardEnabled()) {
    return { source: "kitchenos", importRow: null, previewUrl: null };
  }

  if (input.market.syncMode !== "import" && input.market.syncMode !== "bidirectional") {
    return { source: "kitchenos", importRow: null, previewUrl: null };
  }
  if (!input.market.shopifyMarketId?.trim()) {
    return { source: "kitchenos", importRow: null, previewUrl: null };
  }

  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByProviderWhereForOwner(
      input.ownerUserId,
      IntegrationProvider.SHOPIFY,
    ),
    select: { settingsJson: true },
  });
  if (!conn) return { source: "kitchenos", importRow: null, previewUrl: null };

  const sync = parseShopifyMarketsSyncSettings(conn.settingsJson);
  const importRow = sync.marketHostnameImports?.[input.market.id] ?? null;
  const root = input.rootDomain?.trim();
  const previewUrl =
    importRow && root
      ? `https://${importRow.suggestedHostSubdomain}.${root}`
      : importRow
        ? `/s/${importRow.suggestedStoreSlug}?market=${input.market.id}`
        : null;

  return {
    source: importRow ? "shopify_reference" : "kitchenos",
    importRow,
    previewUrl,
  };
}
