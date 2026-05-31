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

export type ShopifyMarketCatalogImportRow = {
  osMarketId: string;
  shopifyMarketId: string;
  shopifyCatalogId: string | null;
  shopifyPublicationId: string | null;
  importedAt: string;
  externalProductCount: number;
  mappedProductCount: number;
  productIds: string[];
  catalogHash: string;
};

export type ShopifyMarketCatalogExportRow = {
  osMarketId: string;
  shopifyMarketId: string;
  shopifyPublicationId: string | null;
  pushedAt: string;
  publishedCount: number;
  unpublishedCount: number;
  catalogHash: string;
};

export type ShopifyMarketCatalogConflictRow = {
  conflictKey: string;
  osMarketId: string;
  shopifyMarketId: string;
  productId: string;
  externalProductId: string;
  shopifyPublished: boolean;
  kitchenosPublished: boolean;
  detectedAt: string;
  status: "open" | "resolved_shopify" | "resolved_kitchenos" | "ignored";
  catalogAuthority: "shopify" | "kitchenos" | "manual";
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
  lastCatalogImportAt: string | null;
  catalogImportError: string | null;
  marketCatalogImports: Record<string, ShopifyMarketCatalogImportRow>;
  lastCatalogPushAt: string | null;
  lastCatalogPushError: string | null;
  lastCatalogPushTriggeredAt: string | null;
  lastCatalogPushSkippedReason: string | null;
  marketCatalogExports: Record<string, ShopifyMarketCatalogExportRow>;
  lastCatalogReconcileAt: string | null;
  lastCatalogReconcileError: string | null;
  lastCatalogReconcileResult: string | null;
  marketCatalogConflicts: Record<string, ShopifyMarketCatalogConflictRow>;
};

export const SHOPIFY_MARKETS_REQUIRED_SCOPES = ["read_markets", "read_products"] as const;
export const SHOPIFY_MARKETS_PUSH_REQUIRED_SCOPES = [
  "read_markets",
  "read_products",
  "write_products",
] as const;

export const SHOPIFY_MARKETS_CATALOG_PUSH_REQUIRED_SCOPES = [
  "read_markets",
  "read_products",
  "write_products",
  "write_publications",
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

  const marketCatalogImports =
    raw.marketCatalogImports && typeof raw.marketCatalogImports === "object"
      ? (raw.marketCatalogImports as Record<string, ShopifyMarketCatalogImportRow>)
      : {};

  const marketCatalogExports =
    raw.marketCatalogExports && typeof raw.marketCatalogExports === "object"
      ? (raw.marketCatalogExports as Record<string, ShopifyMarketCatalogExportRow>)
      : {};

  const marketCatalogConflicts =
    raw.marketCatalogConflicts && typeof raw.marketCatalogConflicts === "object"
      ? (raw.marketCatalogConflicts as Record<string, ShopifyMarketCatalogConflictRow>)
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
    lastCatalogImportAt: typeof raw.lastCatalogImportAt === "string" ? raw.lastCatalogImportAt : null,
    catalogImportError: typeof raw.catalogImportError === "string" ? raw.catalogImportError : null,
    marketCatalogImports,
    lastCatalogPushAt: typeof raw.lastCatalogPushAt === "string" ? raw.lastCatalogPushAt : null,
    lastCatalogPushError: typeof raw.lastCatalogPushError === "string" ? raw.lastCatalogPushError : null,
    lastCatalogPushTriggeredAt:
      typeof raw.lastCatalogPushTriggeredAt === "string" ? raw.lastCatalogPushTriggeredAt : null,
    lastCatalogPushSkippedReason:
      typeof raw.lastCatalogPushSkippedReason === "string" ? raw.lastCatalogPushSkippedReason : null,
    marketCatalogExports,
    lastCatalogReconcileAt:
      typeof raw.lastCatalogReconcileAt === "string" ? raw.lastCatalogReconcileAt : null,
    lastCatalogReconcileError:
      typeof raw.lastCatalogReconcileError === "string" ? raw.lastCatalogReconcileError : null,
    lastCatalogReconcileResult:
      typeof raw.lastCatalogReconcileResult === "string" ? raw.lastCatalogReconcileResult : null,
    marketCatalogConflicts,
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
