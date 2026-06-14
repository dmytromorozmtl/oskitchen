import type { IntegrationConnection } from "@prisma/client";

import {
  suggestMarketHostSubdomain,
  suggestMarketStoreSlug,
} from "@/lib/commercial/shopify-market-hostname-guard";
import {
  mergeShopifyMarketsSyncSettings,
  parseShopifyMarketsSyncSettings,
  type ShopifyMarketHostnameImportRow,
} from "@/lib/integrations/shopify-markets-settings";
import {
  parseStorefrontMarketsFromSettingsCenter,
  type StorefrontMarket,
} from "@/lib/storefront/markets";
import { computeShopifyMarketHostnameHash } from "@/lib/storefront/revalidate-shopify-market-hostname";
import { prisma } from "@/lib/prisma";
import { toInputJsonValue } from "@/lib/prisma/json";

export function listHostnameGuardStorefrontMarkets(settingsCenterJson: unknown): StorefrontMarket[] {
  return parseStorefrontMarketsFromSettingsCenter(settingsCenterJson).filter((market) => {
    if (market.enabled === false || !market.shopifyMarketId?.trim()) return false;
    return market.syncMode === "import" || market.syncMode === "bidirectional";
  });
}

export function buildHostnameImportRow(input: {
  market: StorefrontMarket;
  primaryStoreSlug: string;
  shopifyHandle: string | null;
  shopifyMarketId: string;
  importedAt: string;
}): ShopifyMarketHostnameImportRow {
  const suggestedHostSubdomain = suggestMarketHostSubdomain({
    storeSlug: input.primaryStoreSlug,
    osMarketId: input.market.id,
    shopifyHandle: input.shopifyHandle,
  });
  const suggestedStoreSlug = suggestMarketStoreSlug({
    primaryStoreSlug: input.primaryStoreSlug,
    shopifyHandle: input.shopifyHandle,
    osMarketId: input.market.id,
  });

  return {
    osMarketId: input.market.id,
    shopifyMarketId: input.shopifyMarketId,
    shopifyHandle: input.shopifyHandle,
    importedAt: input.importedAt,
    suggestedHostSubdomain,
    suggestedStoreSlug,
    hostnameHash: computeShopifyMarketHostnameHash({
      shopifyHandle: input.shopifyHandle,
      suggestedHostSubdomain,
      suggestedStoreSlug,
    }),
  };
}

export async function importShopifyMarketHostnameForConnection(input: {
  userId: string;
  connection: IntegrationConnection;
  primaryStoreSlug: string;
  skipUnchanged?: boolean;
}): Promise<
  | { ok: true; marketsImported: number; marketsUnchanged: number }
  | { ok: false; error: string }
> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: input.userId },
    select: { settingsCenterJson: true },
  });

  const guardMarkets = listHostnameGuardStorefrontMarkets(kitchen?.settingsCenterJson);
  if (guardMarkets.length === 0) {
    return { ok: false, error: "No OS Kitchen markets with hostname guard enabled." };
  }

  const current = parseShopifyMarketsSyncSettings(input.connection.settingsJson);
  const discoveredById = new Map(current.discoveredMarkets.map((row) => [row.id, row]));
  const now = new Date().toISOString();
  let marketsImported = 0;
  let marketsUnchanged = 0;
  const errors: string[] = [];
  const marketHostnameImports: Record<string, ShopifyMarketHostnameImportRow> = {
    ...current.marketHostnameImports,
  };

  for (const market of guardMarkets) {
    const shopifyMarketId = market.shopifyMarketId!.trim();
    const discovered = discoveredById.get(shopifyMarketId);
    if (!discovered) {
      errors.push(`${market.name}: Shopify market not in discovery cache — run Discover markets first.`);
      continue;
    }

    const row = buildHostnameImportRow({
      market,
      primaryStoreSlug: input.primaryStoreSlug,
      shopifyHandle: discovered.handle,
      shopifyMarketId,
      importedAt: now,
    });

    const previous = current.marketHostnameImports[market.id];
    if (input.skipUnchanged && previous?.hostnameHash === row.hostnameHash) {
      marketsUnchanged += 1;
      continue;
    }

    marketHostnameImports[market.id] = row;
    marketsImported += 1;
  }

  await prisma.integrationConnection.update({
    where: { id: input.connection.id },
    data: {
      settingsJson: toInputJsonValue(
        mergeShopifyMarketsSyncSettings(input.connection.settingsJson, {
          lastHostnameImportAt: now,
          hostnameImportError: errors.length > 0 ? errors.join(" · ") : null,
          marketHostnameImports,
        }),
      ),
    },
  });

  if (marketsImported === 0 && marketsUnchanged === 0 && errors.length > 0) {
    return { ok: false, error: errors[0] ?? "Hostname import failed." };
  }

  return { ok: true, marketsImported, marketsUnchanged };
}

export async function applyHostnameImportToMarketSettings(input: {
  userId: string;
  osMarketId: string;
  hostSubdomain: string;
  storeSlug?: string | null;
}): Promise<boolean> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: input.userId },
    select: { settingsCenterJson: true },
  });
  if (!kitchen?.settingsCenterJson || typeof kitchen.settingsCenterJson !== "object") {
    return false;
  }

  const root = { ...(kitchen.settingsCenterJson as Record<string, unknown>) };
  const storefront =
    root.storefront && typeof root.storefront === "object"
      ? { ...(root.storefront as Record<string, unknown>) }
      : {};
  const markets = parseStorefrontMarketsFromSettingsCenter(root);
  const index = markets.findIndex((m) => m.id === input.osMarketId);
  if (index < 0) return false;

  const market = { ...markets[index]! };
  market.hostSubdomain = input.hostSubdomain.trim().toLowerCase();
  if (input.storeSlug?.trim()) {
    market.storeSlug = input.storeSlug.trim().toLowerCase();
  }
  markets[index] = market;
  storefront.markets = markets;
  root.storefront = storefront;

  await prisma.kitchenSettings.update({
    where: { userId: input.userId },
    data: { settingsCenterJson: toInputJsonValue(root) },
  });

  return true;
}
