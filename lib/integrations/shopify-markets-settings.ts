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

export type ShopifyMarketTaxImportRow = {
  osMarketId: string;
  shopifyMarketId: string;
  importedAt: string;
  regionCodes: string[];
  currencyCode: string | null;
  taxIncludedInPrices: boolean | null;
  inferredMode: "single" | "us_sales" | "ca_sales" | "eu_vat";
  taxComponents: Array<{ id: string; label: string; ratePercent: number }>;
  totalRatePercent: number;
  dutiesEnabled: boolean | null;
  taxHash: string;
};

export type ShopifyMarketTaxConflictType =
  | "RATE_MISMATCH"
  | "JURISDICTION_MISSING"
  | "DUTY_UNCONFIGURED"
  | "MODE_MISMATCH";

export type ShopifyMarketTaxConflictRow = {
  conflictKey: string;
  osMarketId: string;
  shopifyMarketId: string;
  conflictType: ShopifyMarketTaxConflictType;
  shopifySummary: string;
  kitchenosSummary: string;
  detectedAt: string;
  status: "open" | "resolved_shopify" | "resolved_kitchenos" | "ignored";
  taxAuthority: "shopify" | "kitchenos" | "manual";
};

export type ShopifyMarketHostnameImportRow = {
  osMarketId: string;
  shopifyMarketId: string;
  shopifyHandle: string | null;
  importedAt: string;
  suggestedHostSubdomain: string;
  suggestedStoreSlug: string;
  hostnameHash: string;
};

export type ShopifyMarketHostnameConflictType =
  | "SLUG_COLLISION"
  | "SUBDOMAIN_TAKEN"
  | "HANDLE_MISMATCH";

export type ShopifyMarketHostnameConflictRow = {
  conflictKey: string;
  osMarketId: string;
  shopifyMarketId: string;
  conflictType: ShopifyMarketHostnameConflictType;
  shopifySummary: string;
  kitchenosSummary: string;
  detectedAt: string;
  status: "open" | "resolved_shopify" | "resolved_kitchenos" | "ignored";
  hostnameAuthority: "shopify" | "kitchenos" | "manual";
};

export type ShopifyB2bCompanyImportRow = {
  shopifyCompanyId: string;
  name: string;
  externalId: string | null;
  mainContactEmail: string | null;
  locationCount: number;
  locationCountries: string[];
  suggestedCompanyAccountId: string | null;
  importedAt: string;
  companyHash: string;
};

export type ShopifyB2bCompanyConflictType =
  | "UNMAPPED"
  | "NAME_MISMATCH"
  | "EMAIL_MISMATCH"
  | "DUPLICATE_LINK";

export type ShopifyB2bCompanyConflictRow = {
  conflictKey: string;
  shopifyCompanyId: string;
  companyAccountId: string | null;
  conflictType: ShopifyB2bCompanyConflictType;
  shopifySummary: string;
  kitchenosSummary: string;
  detectedAt: string;
  status: "open" | "resolved_shopify" | "resolved_kitchenos" | "ignored";
  b2bAuthority: "shopify" | "kitchenos" | "manual";
};

export type ShopifyB2bLocationImportRow = {
  shopifyLocationId: string;
  shopifyCompanyId: string;
  companyName: string;
  locationName: string;
  countryCode: string | null;
  city: string | null;
  suggestedOsMarketId: string | null;
  suggestedCompanyAccountId: string | null;
  importedAt: string;
  locationHash: string;
};

export type ShopifyB2bLocationLinkRow = {
  shopifyLocationId: string;
  shopifyCompanyId: string;
  osMarketId: string | null;
  companyAccountId: string | null;
  linkedAt: string;
};

export type ShopifyB2bLocationConflictType =
  | "REGION_UNMAPPED"
  | "MARKET_MISMATCH"
  | "LOCATION_ORPHAN"
  | "COMPANY_UNLINKED";

export type ShopifyB2bLocationConflictRow = {
  conflictKey: string;
  shopifyLocationId: string;
  shopifyCompanyId: string;
  osMarketId: string | null;
  companyAccountId: string | null;
  conflictType: ShopifyB2bLocationConflictType;
  shopifySummary: string;
  kitchenosSummary: string;
  detectedAt: string;
  status: "open" | "resolved_shopify" | "resolved_kitchenos" | "ignored";
  b2bLocationAuthority: "shopify" | "kitchenos" | "manual";
};

export type ShopifyMarketsWebhookRegistryRow = {
  topic: string;
  graphqlTopic: string;
  routeSegment: string;
  label: string;
  expectedCallbackUrl: string;
  shopifySubscriptionId: string | null;
  actualCallbackUrl: string | null;
  registeredAt: string | null;
  lastSyncedAt: string;
  lastDeliveryAt: string | null;
  failureCount: number;
  driftStatus: "ok" | "missing" | "wrong_url" | "stale" | "never_delivered";
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
  lastTaxImportAt: string | null;
  taxImportError: string | null;
  marketTaxImports: Record<string, ShopifyMarketTaxImportRow>;
  lastTaxReconcileAt: string | null;
  lastTaxReconcileError: string | null;
  lastTaxReconcileResult: string | null;
  marketTaxConflicts: Record<string, ShopifyMarketTaxConflictRow>;
  lastHostnameImportAt: string | null;
  hostnameImportError: string | null;
  marketHostnameImports: Record<string, ShopifyMarketHostnameImportRow>;
  lastHostnameReconcileAt: string | null;
  lastHostnameReconcileError: string | null;
  lastHostnameReconcileResult: string | null;
  marketHostnameConflicts: Record<string, ShopifyMarketHostnameConflictRow>;
  lastWebhookRegistrySyncAt: string | null;
  webhookRegistrySyncError: string | null;
  lastWebhookRegistryRegisterAt: string | null;
  lastWebhookRegistryRegisterError: string | null;
  lastWebhookRegistryDriftCount: number | null;
  marketWebhookRegistry: Record<string, ShopifyMarketsWebhookRegistryRow>;
  lastFullMarketsReconcileAt: string | null;
  lastFullMarketsReconcileResult: string | null;
  lastFullMarketsReconcileError: string | null;
  b2bAuthority: "shopify" | "kitchenos" | "manual";
  b2bUnavailableReason: string | null;
  lastB2bImportAt: string | null;
  b2bImportError: string | null;
  b2bCompanyImports: Record<string, ShopifyB2bCompanyImportRow>;
  lastB2bReconcileAt: string | null;
  lastB2bReconcileError: string | null;
  lastB2bReconcileResult: string | null;
  b2bCompanyConflicts: Record<string, ShopifyB2bCompanyConflictRow>;
  b2bCompanyLinks: Record<string, string>;
  b2bLocationAuthority: "shopify" | "kitchenos" | "manual";
  lastB2bLocationImportAt: string | null;
  b2bLocationImportError: string | null;
  b2bLocationImports: Record<string, ShopifyB2bLocationImportRow>;
  lastB2bLocationReconcileAt: string | null;
  lastB2bLocationReconcileError: string | null;
  lastB2bLocationReconcileResult: string | null;
  b2bLocationConflicts: Record<string, ShopifyB2bLocationConflictRow>;
  b2bLocationLinks: Record<string, ShopifyB2bLocationLinkRow>;
  lastB2bOrderEnrichmentAt: string | null;
  b2bOrderEnrichmentStats: {
    complete: number;
    partial: number;
    unresolved: number;
    total: number;
  } | null;
  lastB2bKitchenOrderPromoteAt: string | null;
  b2bKitchenOrderStats: {
    promoted: number;
    complete: number;
    partial: number;
    unresolved: number;
    missingCompanyLink: number;
  } | null;
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

export const SHOPIFY_MARKETS_WEBHOOK_REGISTRY_REQUIRED_SCOPES = [
  "read_webhooks",
  "write_webhooks",
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

  const marketTaxImports =
    raw.marketTaxImports && typeof raw.marketTaxImports === "object"
      ? (raw.marketTaxImports as Record<string, ShopifyMarketTaxImportRow>)
      : {};

  const marketTaxConflicts =
    raw.marketTaxConflicts && typeof raw.marketTaxConflicts === "object"
      ? (raw.marketTaxConflicts as Record<string, ShopifyMarketTaxConflictRow>)
      : {};

  const marketHostnameImports =
    raw.marketHostnameImports && typeof raw.marketHostnameImports === "object"
      ? (raw.marketHostnameImports as Record<string, ShopifyMarketHostnameImportRow>)
      : {};

  const marketHostnameConflicts =
    raw.marketHostnameConflicts && typeof raw.marketHostnameConflicts === "object"
      ? (raw.marketHostnameConflicts as Record<string, ShopifyMarketHostnameConflictRow>)
      : {};

  const marketWebhookRegistry =
    raw.marketWebhookRegistry && typeof raw.marketWebhookRegistry === "object"
      ? (raw.marketWebhookRegistry as Record<string, ShopifyMarketsWebhookRegistryRow>)
      : {};

  const b2bCompanyImports =
    raw.b2bCompanyImports && typeof raw.b2bCompanyImports === "object"
      ? (raw.b2bCompanyImports as Record<string, ShopifyB2bCompanyImportRow>)
      : {};

  const b2bCompanyConflicts =
    raw.b2bCompanyConflicts && typeof raw.b2bCompanyConflicts === "object"
      ? (raw.b2bCompanyConflicts as Record<string, ShopifyB2bCompanyConflictRow>)
      : {};

  const b2bCompanyLinks =
    raw.b2bCompanyLinks && typeof raw.b2bCompanyLinks === "object"
      ? (raw.b2bCompanyLinks as Record<string, string>)
      : {};

  const b2bAuthorityRaw = raw.b2bAuthority;
  const b2bAuthority =
    b2bAuthorityRaw === "shopify" || b2bAuthorityRaw === "kitchenos" || b2bAuthorityRaw === "manual"
      ? b2bAuthorityRaw
      : "kitchenos";

  const b2bLocationImports =
    raw.b2bLocationImports && typeof raw.b2bLocationImports === "object"
      ? (raw.b2bLocationImports as Record<string, ShopifyB2bLocationImportRow>)
      : {};

  const b2bLocationConflicts =
    raw.b2bLocationConflicts && typeof raw.b2bLocationConflicts === "object"
      ? (raw.b2bLocationConflicts as Record<string, ShopifyB2bLocationConflictRow>)
      : {};

  const b2bLocationLinks =
    raw.b2bLocationLinks && typeof raw.b2bLocationLinks === "object"
      ? (raw.b2bLocationLinks as Record<string, ShopifyB2bLocationLinkRow>)
      : {};

  const b2bLocationAuthorityRaw = raw.b2bLocationAuthority ?? raw.b2bAuthority;
  const b2bLocationAuthority =
    b2bLocationAuthorityRaw === "shopify" ||
    b2bLocationAuthorityRaw === "kitchenos" ||
    b2bLocationAuthorityRaw === "manual"
      ? b2bLocationAuthorityRaw
      : b2bAuthority;

  const statsRaw = raw.b2bOrderEnrichmentStats;
  const b2bOrderEnrichmentStats =
    statsRaw && typeof statsRaw === "object"
      ? {
          complete: Number((statsRaw as Record<string, unknown>).complete) || 0,
          partial: Number((statsRaw as Record<string, unknown>).partial) || 0,
          unresolved: Number((statsRaw as Record<string, unknown>).unresolved) || 0,
          total: Number((statsRaw as Record<string, unknown>).total) || 0,
        }
      : null;

  const kitchenStatsRaw = raw.b2bKitchenOrderStats;
  const b2bKitchenOrderStats =
    kitchenStatsRaw && typeof kitchenStatsRaw === "object"
      ? {
          promoted: Number((kitchenStatsRaw as Record<string, unknown>).promoted) || 0,
          complete: Number((kitchenStatsRaw as Record<string, unknown>).complete) || 0,
          partial: Number((kitchenStatsRaw as Record<string, unknown>).partial) || 0,
          unresolved: Number((kitchenStatsRaw as Record<string, unknown>).unresolved) || 0,
          missingCompanyLink:
            Number((kitchenStatsRaw as Record<string, unknown>).missingCompanyLink) || 0,
        }
      : null;

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
    lastTaxImportAt: typeof raw.lastTaxImportAt === "string" ? raw.lastTaxImportAt : null,
    taxImportError: typeof raw.taxImportError === "string" ? raw.taxImportError : null,
    marketTaxImports,
    lastTaxReconcileAt: typeof raw.lastTaxReconcileAt === "string" ? raw.lastTaxReconcileAt : null,
    lastTaxReconcileError: typeof raw.lastTaxReconcileError === "string" ? raw.lastTaxReconcileError : null,
    lastTaxReconcileResult:
      typeof raw.lastTaxReconcileResult === "string" ? raw.lastTaxReconcileResult : null,
    marketTaxConflicts,
    lastHostnameImportAt:
      typeof raw.lastHostnameImportAt === "string" ? raw.lastHostnameImportAt : null,
    hostnameImportError: typeof raw.hostnameImportError === "string" ? raw.hostnameImportError : null,
    marketHostnameImports,
    lastHostnameReconcileAt:
      typeof raw.lastHostnameReconcileAt === "string" ? raw.lastHostnameReconcileAt : null,
    lastHostnameReconcileError:
      typeof raw.lastHostnameReconcileError === "string" ? raw.lastHostnameReconcileError : null,
    lastHostnameReconcileResult:
      typeof raw.lastHostnameReconcileResult === "string" ? raw.lastHostnameReconcileResult : null,
    marketHostnameConflicts,
    lastWebhookRegistrySyncAt:
      typeof raw.lastWebhookRegistrySyncAt === "string" ? raw.lastWebhookRegistrySyncAt : null,
    webhookRegistrySyncError:
      typeof raw.webhookRegistrySyncError === "string" ? raw.webhookRegistrySyncError : null,
    lastWebhookRegistryRegisterAt:
      typeof raw.lastWebhookRegistryRegisterAt === "string" ? raw.lastWebhookRegistryRegisterAt : null,
    lastWebhookRegistryRegisterError:
      typeof raw.lastWebhookRegistryRegisterError === "string" ? raw.lastWebhookRegistryRegisterError : null,
    lastWebhookRegistryDriftCount:
      typeof raw.lastWebhookRegistryDriftCount === "number" ? raw.lastWebhookRegistryDriftCount : null,
    marketWebhookRegistry,
    lastFullMarketsReconcileAt:
      typeof raw.lastFullMarketsReconcileAt === "string" ? raw.lastFullMarketsReconcileAt : null,
    lastFullMarketsReconcileResult:
      typeof raw.lastFullMarketsReconcileResult === "string" ? raw.lastFullMarketsReconcileResult : null,
    lastFullMarketsReconcileError:
      typeof raw.lastFullMarketsReconcileError === "string" ? raw.lastFullMarketsReconcileError : null,
    b2bAuthority,
    b2bUnavailableReason:
      typeof raw.b2bUnavailableReason === "string" ? raw.b2bUnavailableReason : null,
    lastB2bImportAt: typeof raw.lastB2bImportAt === "string" ? raw.lastB2bImportAt : null,
    b2bImportError: typeof raw.b2bImportError === "string" ? raw.b2bImportError : null,
    b2bCompanyImports,
    lastB2bReconcileAt: typeof raw.lastB2bReconcileAt === "string" ? raw.lastB2bReconcileAt : null,
    lastB2bReconcileError:
      typeof raw.lastB2bReconcileError === "string" ? raw.lastB2bReconcileError : null,
    lastB2bReconcileResult:
      typeof raw.lastB2bReconcileResult === "string" ? raw.lastB2bReconcileResult : null,
    b2bCompanyConflicts,
    b2bCompanyLinks,
    b2bLocationAuthority,
    lastB2bLocationImportAt:
      typeof raw.lastB2bLocationImportAt === "string" ? raw.lastB2bLocationImportAt : null,
    b2bLocationImportError:
      typeof raw.b2bLocationImportError === "string" ? raw.b2bLocationImportError : null,
    b2bLocationImports,
    lastB2bLocationReconcileAt:
      typeof raw.lastB2bLocationReconcileAt === "string" ? raw.lastB2bLocationReconcileAt : null,
    lastB2bLocationReconcileError:
      typeof raw.lastB2bLocationReconcileError === "string" ? raw.lastB2bLocationReconcileError : null,
    lastB2bLocationReconcileResult:
      typeof raw.lastB2bLocationReconcileResult === "string" ? raw.lastB2bLocationReconcileResult : null,
    b2bLocationConflicts,
    b2bLocationLinks,
    lastB2bOrderEnrichmentAt:
      typeof raw.lastB2bOrderEnrichmentAt === "string" ? raw.lastB2bOrderEnrichmentAt : null,
    b2bOrderEnrichmentStats,
    lastB2bKitchenOrderPromoteAt:
      typeof raw.lastB2bKitchenOrderPromoteAt === "string"
        ? raw.lastB2bKitchenOrderPromoteAt
        : null,
    b2bKitchenOrderStats,
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
