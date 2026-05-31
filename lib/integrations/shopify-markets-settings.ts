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
  b2bCateringRollupMinTotal: number | null;
  lastB2bCateringRollupAt: string | null;
  b2bCateringRollupStats: {
    quotesCreated: number;
    ordersAppended: number;
    linesRolled: number;
    skippedBelowThreshold: number;
    skippedIncomplete: number;
    skippedAlreadyLinked: number;
  } | null;
  b2bRequirePurchaseOrder: boolean;
  lastB2bNetTermsEnrichmentAt: string | null;
  b2bNetTermsStats: {
    withNetTerms: number;
    withPoNumber: number;
    missingPoWhenRequired: number;
  } | null;
  b2bAutoGenerateInvoice: boolean;
  lastB2bInvoiceGeneratedAt: string | null;
  b2bInvoiceStats: {
    draftsCreated: number;
    skippedNoTerms: number;
    skippedIncomplete: number;
    skippedAlreadyLinked: number;
    skippedMissingPo: number;
    skippedDisabled: number;
  } | null;
  b2bInvoiceOverdueGraceDays: number | null;
  lastB2bPaymentCollectedAt: string | null;
  b2bPaymentCollectionStats: {
    markedPaid: number;
    markedPartial: number;
    skippedAlreadyPaid: number;
    skippedNoDraft: number;
    overdueOpen: number;
  } | null;
  b2bArReminderEnabled: boolean;
  lastB2bArReminderAt: string | null;
  b2bArAgingStats: {
    lastSnapshotOpen: number;
    bucket0_30: number;
    bucket31_60: number;
    bucket61Plus: number;
    remindersSent: number;
    remindersSkipped: number;
  } | null;
  b2bAutoDunningEnabled: boolean;
  b2bOperatorDigestEnabled: boolean;
  b2bDunningCadenceDays: number[] | null;
  lastB2bDunningRunAt: string | null;
  lastB2bOperatorDigestAt: string | null;
  b2bDunningStats: {
    runs: number;
    digestsSent: number;
    autoRemindersSent: number;
    skippedEmailOff: number;
    skippedDisabled: number;
    skippedRecentDigest: number;
    skippedNoOpenInvoices: number;
  } | null;
  b2bPayPortalEnabled: boolean;
  b2bPayPortalTokenTtlDays: number | null;
  lastB2bPayPortalCheckoutAt: string | null;
  b2bPayPortalStats: {
    linksMinted: number;
    checkoutStarted: number;
    checkoutCompleted: number;
    skippedNoStripe: number;
    skippedAlreadyPaid: number;
  } | null;
  b2bArDashboardEnabled: boolean;
  lastB2bArDashboardViewAt: string | null;
  lastB2bArDashboardExportAt: string | null;
  b2bArHealthScore: number | null;
  b2bArCollectorsByCompanyId: Record<string, string> | null;
  b2bArDashboardStats: {
    views: number;
    bulkRemindersSent: number;
    bulkPayLinksMinted: number;
    csvExports: number;
    collectorsAssigned: number;
  } | null;
  lastB2bFinancialMirrorRefreshAt: string | null;
  lastB2bFinancialMirrorRefreshResult: string | null;
  b2bFinancialMirrorStats: {
    capturedAtPromote: number;
    refreshed: number;
    refreshSkipped: number;
    refreshErrors: number;
    lastDriftCount: number;
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

  const rollupStatsRaw = raw.b2bCateringRollupStats;
  const b2bCateringRollupStats =
    rollupStatsRaw && typeof rollupStatsRaw === "object"
      ? {
          quotesCreated: Number((rollupStatsRaw as Record<string, unknown>).quotesCreated) || 0,
          ordersAppended: Number((rollupStatsRaw as Record<string, unknown>).ordersAppended) || 0,
          linesRolled: Number((rollupStatsRaw as Record<string, unknown>).linesRolled) || 0,
          skippedBelowThreshold:
            Number((rollupStatsRaw as Record<string, unknown>).skippedBelowThreshold) || 0,
          skippedIncomplete:
            Number((rollupStatsRaw as Record<string, unknown>).skippedIncomplete) || 0,
          skippedAlreadyLinked:
            Number((rollupStatsRaw as Record<string, unknown>).skippedAlreadyLinked) || 0,
        }
      : null;

  const b2bCateringRollupMinTotalRaw = raw.b2bCateringRollupMinTotal;
  const b2bCateringRollupMinTotal =
    typeof b2bCateringRollupMinTotalRaw === "number" && b2bCateringRollupMinTotalRaw > 0
      ? b2bCateringRollupMinTotalRaw
      : null;

  const netTermsStatsRaw = raw.b2bNetTermsStats;
  const b2bNetTermsStats =
    netTermsStatsRaw && typeof netTermsStatsRaw === "object"
      ? {
          withNetTerms: Number((netTermsStatsRaw as Record<string, unknown>).withNetTerms) || 0,
          withPoNumber: Number((netTermsStatsRaw as Record<string, unknown>).withPoNumber) || 0,
          missingPoWhenRequired:
            Number((netTermsStatsRaw as Record<string, unknown>).missingPoWhenRequired) || 0,
        }
      : null;

  const b2bRequirePurchaseOrder = raw.b2bRequirePurchaseOrder === true;

  const invoiceStatsRaw = raw.b2bInvoiceStats;
  const b2bInvoiceStats =
    invoiceStatsRaw && typeof invoiceStatsRaw === "object"
      ? {
          draftsCreated: Number((invoiceStatsRaw as Record<string, unknown>).draftsCreated) || 0,
          skippedNoTerms: Number((invoiceStatsRaw as Record<string, unknown>).skippedNoTerms) || 0,
          skippedIncomplete:
            Number((invoiceStatsRaw as Record<string, unknown>).skippedIncomplete) || 0,
          skippedAlreadyLinked:
            Number((invoiceStatsRaw as Record<string, unknown>).skippedAlreadyLinked) || 0,
          skippedMissingPo: Number((invoiceStatsRaw as Record<string, unknown>).skippedMissingPo) || 0,
          skippedDisabled: Number((invoiceStatsRaw as Record<string, unknown>).skippedDisabled) || 0,
        }
      : null;

  const b2bAutoGenerateInvoice = raw.b2bAutoGenerateInvoice !== false;

  const paymentCollectionStatsRaw = raw.b2bPaymentCollectionStats;
  const b2bPaymentCollectionStats =
    paymentCollectionStatsRaw && typeof paymentCollectionStatsRaw === "object"
      ? {
          markedPaid: Number((paymentCollectionStatsRaw as Record<string, unknown>).markedPaid) || 0,
          markedPartial:
            Number((paymentCollectionStatsRaw as Record<string, unknown>).markedPartial) || 0,
          skippedAlreadyPaid:
            Number((paymentCollectionStatsRaw as Record<string, unknown>).skippedAlreadyPaid) || 0,
          skippedNoDraft:
            Number((paymentCollectionStatsRaw as Record<string, unknown>).skippedNoDraft) || 0,
          overdueOpen:
            Number((paymentCollectionStatsRaw as Record<string, unknown>).overdueOpen) || 0,
        }
      : null;

  const overdueGraceRaw = raw.b2bInvoiceOverdueGraceDays;
  const b2bInvoiceOverdueGraceDays =
    typeof overdueGraceRaw === "number" && overdueGraceRaw >= 0 ? overdueGraceRaw : null;

  const arAgingStatsRaw = raw.b2bArAgingStats;
  const b2bArAgingStats =
    arAgingStatsRaw && typeof arAgingStatsRaw === "object"
      ? {
          lastSnapshotOpen: Number((arAgingStatsRaw as Record<string, unknown>).lastSnapshotOpen) || 0,
          bucket0_30: Number((arAgingStatsRaw as Record<string, unknown>).bucket0_30) || 0,
          bucket31_60: Number((arAgingStatsRaw as Record<string, unknown>).bucket31_60) || 0,
          bucket61Plus: Number((arAgingStatsRaw as Record<string, unknown>).bucket61Plus) || 0,
          remindersSent: Number((arAgingStatsRaw as Record<string, unknown>).remindersSent) || 0,
          remindersSkipped: Number((arAgingStatsRaw as Record<string, unknown>).remindersSkipped) || 0,
        }
      : null;

  const b2bArReminderEnabled = raw.b2bArReminderEnabled !== false;

  const dunningStatsRaw = raw.b2bDunningStats;
  const b2bDunningStats =
    dunningStatsRaw && typeof dunningStatsRaw === "object"
      ? {
          runs: Number((dunningStatsRaw as Record<string, unknown>).runs) || 0,
          digestsSent: Number((dunningStatsRaw as Record<string, unknown>).digestsSent) || 0,
          autoRemindersSent:
            Number((dunningStatsRaw as Record<string, unknown>).autoRemindersSent) || 0,
          skippedEmailOff: Number((dunningStatsRaw as Record<string, unknown>).skippedEmailOff) || 0,
          skippedDisabled: Number((dunningStatsRaw as Record<string, unknown>).skippedDisabled) || 0,
          skippedRecentDigest:
            Number((dunningStatsRaw as Record<string, unknown>).skippedRecentDigest) || 0,
          skippedNoOpenInvoices:
            Number((dunningStatsRaw as Record<string, unknown>).skippedNoOpenInvoices) || 0,
        }
      : null;

  const cadenceRaw = raw.b2bDunningCadenceDays;
  const b2bDunningCadenceDays = Array.isArray(cadenceRaw)
    ? cadenceRaw.map((d) => Number(d)).filter((d) => Number.isFinite(d) && d > 0)
    : null;

  const b2bAutoDunningEnabled = raw.b2bAutoDunningEnabled === true;
  const b2bOperatorDigestEnabled = raw.b2bOperatorDigestEnabled !== false;
  const b2bPayPortalEnabled = raw.b2bPayPortalEnabled !== false;
  const b2bPayPortalTokenTtlDays =
    typeof raw.b2bPayPortalTokenTtlDays === "number" && raw.b2bPayPortalTokenTtlDays > 0
      ? raw.b2bPayPortalTokenTtlDays
      : null;
  const payPortalStatsRaw = raw.b2bPayPortalStats;
  const b2bPayPortalStats =
    payPortalStatsRaw && typeof payPortalStatsRaw === "object"
      ? {
          linksMinted: Number((payPortalStatsRaw as Record<string, unknown>).linksMinted) || 0,
          checkoutStarted: Number((payPortalStatsRaw as Record<string, unknown>).checkoutStarted) || 0,
          checkoutCompleted:
            Number((payPortalStatsRaw as Record<string, unknown>).checkoutCompleted) || 0,
          skippedNoStripe: Number((payPortalStatsRaw as Record<string, unknown>).skippedNoStripe) || 0,
          skippedAlreadyPaid:
            Number((payPortalStatsRaw as Record<string, unknown>).skippedAlreadyPaid) || 0,
        }
      : null;

  const b2bArDashboardEnabled = raw.b2bArDashboardEnabled !== false;
  const b2bArHealthScore =
    typeof raw.b2bArHealthScore === "number" && Number.isFinite(raw.b2bArHealthScore)
      ? raw.b2bArHealthScore
      : null;
  const collectorsRaw = raw.b2bArCollectorsByCompanyId;
  const b2bArCollectorsByCompanyId =
    collectorsRaw && typeof collectorsRaw === "object" && !Array.isArray(collectorsRaw)
      ? Object.fromEntries(
          Object.entries(collectorsRaw as Record<string, unknown>)
            .filter(([, v]) => typeof v === "string" && v.trim())
            .map(([k, v]) => [k, String(v).trim()]),
        )
      : null;
  const dashboardStatsRaw = raw.b2bArDashboardStats;
  const b2bArDashboardStats =
    dashboardStatsRaw && typeof dashboardStatsRaw === "object"
      ? {
          views: Number((dashboardStatsRaw as Record<string, unknown>).views) || 0,
          bulkRemindersSent:
            Number((dashboardStatsRaw as Record<string, unknown>).bulkRemindersSent) || 0,
          bulkPayLinksMinted:
            Number((dashboardStatsRaw as Record<string, unknown>).bulkPayLinksMinted) || 0,
          csvExports: Number((dashboardStatsRaw as Record<string, unknown>).csvExports) || 0,
          collectorsAssigned:
            Number((dashboardStatsRaw as Record<string, unknown>).collectorsAssigned) || 0,
        }
      : null;

  const mirrorStatsRaw = raw.b2bFinancialMirrorStats;
  const b2bFinancialMirrorStats =
    mirrorStatsRaw && typeof mirrorStatsRaw === "object"
      ? {
          capturedAtPromote:
            Number((mirrorStatsRaw as Record<string, unknown>).capturedAtPromote) || 0,
          refreshed: Number((mirrorStatsRaw as Record<string, unknown>).refreshed) || 0,
          refreshSkipped: Number((mirrorStatsRaw as Record<string, unknown>).refreshSkipped) || 0,
          refreshErrors: Number((mirrorStatsRaw as Record<string, unknown>).refreshErrors) || 0,
          lastDriftCount: Number((mirrorStatsRaw as Record<string, unknown>).lastDriftCount) || 0,
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
    b2bCateringRollupMinTotal,
    lastB2bCateringRollupAt:
      typeof raw.lastB2bCateringRollupAt === "string" ? raw.lastB2bCateringRollupAt : null,
    b2bCateringRollupStats,
    b2bRequirePurchaseOrder,
    lastB2bNetTermsEnrichmentAt:
      typeof raw.lastB2bNetTermsEnrichmentAt === "string" ? raw.lastB2bNetTermsEnrichmentAt : null,
    b2bNetTermsStats,
    b2bAutoGenerateInvoice,
    lastB2bInvoiceGeneratedAt:
      typeof raw.lastB2bInvoiceGeneratedAt === "string" ? raw.lastB2bInvoiceGeneratedAt : null,
    b2bInvoiceStats,
    b2bInvoiceOverdueGraceDays,
    lastB2bPaymentCollectedAt:
      typeof raw.lastB2bPaymentCollectedAt === "string" ? raw.lastB2bPaymentCollectedAt : null,
    b2bPaymentCollectionStats,
    b2bArReminderEnabled,
    lastB2bArReminderAt:
      typeof raw.lastB2bArReminderAt === "string" ? raw.lastB2bArReminderAt : null,
    b2bArAgingStats,
    b2bAutoDunningEnabled,
    b2bOperatorDigestEnabled,
    b2bDunningCadenceDays: b2bDunningCadenceDays?.length ? b2bDunningCadenceDays : null,
    lastB2bDunningRunAt:
      typeof raw.lastB2bDunningRunAt === "string" ? raw.lastB2bDunningRunAt : null,
    lastB2bOperatorDigestAt:
      typeof raw.lastB2bOperatorDigestAt === "string" ? raw.lastB2bOperatorDigestAt : null,
    b2bDunningStats,
    b2bPayPortalEnabled,
    b2bPayPortalTokenTtlDays,
    lastB2bPayPortalCheckoutAt:
      typeof raw.lastB2bPayPortalCheckoutAt === "string" ? raw.lastB2bPayPortalCheckoutAt : null,
    b2bPayPortalStats,
    b2bArDashboardEnabled,
    lastB2bArDashboardViewAt:
      typeof raw.lastB2bArDashboardViewAt === "string" ? raw.lastB2bArDashboardViewAt : null,
    lastB2bArDashboardExportAt:
      typeof raw.lastB2bArDashboardExportAt === "string" ? raw.lastB2bArDashboardExportAt : null,
    b2bArHealthScore,
    b2bArCollectorsByCompanyId,
    b2bArDashboardStats,
    lastB2bFinancialMirrorRefreshAt:
      typeof raw.lastB2bFinancialMirrorRefreshAt === "string"
        ? raw.lastB2bFinancialMirrorRefreshAt
        : null,
    lastB2bFinancialMirrorRefreshResult:
      typeof raw.lastB2bFinancialMirrorRefreshResult === "string"
        ? raw.lastB2bFinancialMirrorRefreshResult
        : null,
    b2bFinancialMirrorStats,
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
