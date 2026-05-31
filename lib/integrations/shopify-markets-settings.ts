import type { ShopifyMarketRow } from "@/services/integrations/shopify-markets-service";

export type ShopifyMarketPriceImportRow = {
  osMarketId: string;
  shopifyMarketId: string;
  shopifyPriceListId: string | null;
  currencyCode: string | null;
  importedAt: string;
  variantCount: number;
  mappedProductCount: number;
  productPrices: Record<string, string>;
  priceHash: string;
};

export type ShopifyMarketPriceExportRow = {
  osMarketId: string;
  shopifyMarketId: string;
  shopifyPriceListId: string | null;
  currencyCode: string | null;
  pushedAt: string;
  variantCount: number;
  pushedVariantCount: number;
  priceHash: string;
};

export type ShopifyMarketPriceConflictRow = {
  conflictKey: string;
  osMarketId: string;
  shopifyMarketId: string;
  productId: string;
  externalVariantId: string;
  shopifyAmount: string;
  kitchenosAmount: string;
  detectedAt: string;
  status: "open" | "resolved_shopify" | "resolved_kitchenos" | "ignored";
  priceAuthority: "shopify" | "kitchenos" | "manual";
};

export type ShopifyMarketsSyncSettings = {
  lastDiscoveryAt: string | null;
  primaryShopifyMarketId: string | null;
  discoveredMarkets: ShopifyMarketRow[];
  discoveryError: string | null;
  requiredScopesNote: string | null;
  lastPriceImportAt: string | null;
  priceImportError: string | null;
  marketPriceImports: Record<string, ShopifyMarketPriceImportRow>;
  lastWebhookPriceImportAt: string | null;
  lastWebhookPriceImportTopic: string | null;
  lastWebhookPriceImportTriggeredAt: string | null;
  lastWebhookPriceImportSkippedReason: string | null;
  lastPricePushAt: string | null;
  lastPricePushError: string | null;
  lastPricePushTriggeredAt: string | null;
  lastPricePushSkippedReason: string | null;
  lastPricePushOrigin: string | null;
  marketPriceExports: Record<string, ShopifyMarketPriceExportRow>;
  lastBidirectionalReconcileAt: string | null;
  lastBidirectionalReconcileError: string | null;
  lastBidirectionalReconcileResult: string | null;
  marketPriceConflicts: Record<string, ShopifyMarketPriceConflictRow>;
};

export const SHOPIFY_MARKETS_REQUIRED_SCOPES = ["read_markets", "read_products"] as const;
export const SHOPIFY_MARKETS_PUSH_REQUIRED_SCOPES = [
  "read_markets",
  "read_products",
  "write_products",
] as const;

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

  const marketPriceImports =
    raw.marketPriceImports && typeof raw.marketPriceImports === "object"
      ? (raw.marketPriceImports as Record<string, ShopifyMarketPriceImportRow>)
      : {};

  const marketPriceExports =
    raw.marketPriceExports && typeof raw.marketPriceExports === "object"
      ? (raw.marketPriceExports as Record<string, ShopifyMarketPriceExportRow>)
      : {};

  const marketPriceConflicts =
    raw.marketPriceConflicts && typeof raw.marketPriceConflicts === "object"
      ? (raw.marketPriceConflicts as Record<string, ShopifyMarketPriceConflictRow>)
      : {};

  return {
    lastDiscoveryAt: typeof raw.lastDiscoveryAt === "string" ? raw.lastDiscoveryAt : null,
    primaryShopifyMarketId:
      typeof raw.primaryShopifyMarketId === "string" ? raw.primaryShopifyMarketId : null,
    discoveredMarkets,
    discoveryError: typeof raw.discoveryError === "string" ? raw.discoveryError : null,
    requiredScopesNote:
      typeof raw.requiredScopesNote === "string" ? raw.requiredScopesNote : null,
    lastPriceImportAt: typeof raw.lastPriceImportAt === "string" ? raw.lastPriceImportAt : null,
    priceImportError: typeof raw.priceImportError === "string" ? raw.priceImportError : null,
    marketPriceImports,
    lastWebhookPriceImportAt:
      typeof raw.lastWebhookPriceImportAt === "string" ? raw.lastWebhookPriceImportAt : null,
    lastWebhookPriceImportTopic:
      typeof raw.lastWebhookPriceImportTopic === "string" ? raw.lastWebhookPriceImportTopic : null,
    lastWebhookPriceImportTriggeredAt:
      typeof raw.lastWebhookPriceImportTriggeredAt === "string"
        ? raw.lastWebhookPriceImportTriggeredAt
        : null,
    lastWebhookPriceImportSkippedReason:
      typeof raw.lastWebhookPriceImportSkippedReason === "string"
        ? raw.lastWebhookPriceImportSkippedReason
        : null,
    lastPricePushAt: typeof raw.lastPricePushAt === "string" ? raw.lastPricePushAt : null,
    lastPricePushError: typeof raw.lastPricePushError === "string" ? raw.lastPricePushError : null,
    lastPricePushTriggeredAt:
      typeof raw.lastPricePushTriggeredAt === "string" ? raw.lastPricePushTriggeredAt : null,
    lastPricePushSkippedReason:
      typeof raw.lastPricePushSkippedReason === "string" ? raw.lastPricePushSkippedReason : null,
    lastPricePushOrigin: typeof raw.lastPricePushOrigin === "string" ? raw.lastPricePushOrigin : null,
    marketPriceExports,
    lastBidirectionalReconcileAt:
      typeof raw.lastBidirectionalReconcileAt === "string" ? raw.lastBidirectionalReconcileAt : null,
    lastBidirectionalReconcileError:
      typeof raw.lastBidirectionalReconcileError === "string" ? raw.lastBidirectionalReconcileError : null,
    lastBidirectionalReconcileResult:
      typeof raw.lastBidirectionalReconcileResult === "string" ? raw.lastBidirectionalReconcileResult : null,
    marketPriceConflicts,
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
