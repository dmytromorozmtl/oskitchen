import type { ShopifyMarketRow } from "@/services/integrations/shopify-markets-service";

export type ShopifyMarketsSyncSettings = {
  lastDiscoveryAt: string | null;
  primaryShopifyMarketId: string | null;
  discoveredMarkets: ShopifyMarketRow[];
  discoveryError: string | null;
  requiredScopesNote: string | null;
};

export const SHOPIFY_MARKETS_REQUIRED_SCOPES = ["read_markets"] as const;

export function parseShopifyMarketsSyncSettings(settingsJson: unknown): ShopifyMarketsSyncSettings {
  const root =
    settingsJson && typeof settingsJson === "object"
      ? (settingsJson as Record<string, unknown>)
      : {};
  const raw =
    root.marketsSync && typeof root.marketsSync === "object"
      ? (root.marketsSync as Record<string, unknown>)
      : {};

  const discoveredMarkets = Array.isArray(raw.discoveredMarkets)
    ? (raw.discoveredMarkets as ShopifyMarketRow[]).filter(
        (row) => typeof row?.id === "string" && typeof row?.name === "string",
      )
    : [];

  return {
    lastDiscoveryAt: typeof raw.lastDiscoveryAt === "string" ? raw.lastDiscoveryAt : null,
    primaryShopifyMarketId:
      typeof raw.primaryShopifyMarketId === "string" ? raw.primaryShopifyMarketId : null,
    discoveredMarkets,
    discoveryError: typeof raw.discoveryError === "string" ? raw.discoveryError : null,
    requiredScopesNote:
      typeof raw.requiredScopesNote === "string" ? raw.requiredScopesNote : null,
  };
}

export function mergeShopifyMarketsSyncSettings(
  settingsJson: unknown,
  patch: Partial<ShopifyMarketsSyncSettings>,
): Record<string, unknown> {
  const root =
    settingsJson && typeof settingsJson === "object"
      ? { ...(settingsJson as Record<string, unknown>) }
      : {};
  const current = parseShopifyMarketsSyncSettings(root);
  root.marketsSync = { ...current, ...patch };
  return root;
}
