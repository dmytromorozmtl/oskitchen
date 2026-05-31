import { describe, expect, it } from "vitest";

import {
  computeMarketsHealthScore,
  healthLevelLabel,
  isTimestampStale,
  levelFromScore,
} from "@/lib/commercial/shopify-markets-health-dashboard";
import type { ShopifyMarketsSyncSettings } from "@/lib/integrations/shopify-markets-settings";
import type { StorefrontMarket } from "@/lib/storefront/markets";
import { buildShopifyMarketsHealthSnapshot } from "@/services/integrations/shopify-markets-health-service";

const osMarkets: StorefrontMarket[] = [
  {
    id: "eu",
    name: "Europe",
    currency: "EUR",
    enabled: true,
    shopifyMarketId: "gid://shopify/Market/1",
    syncMode: "bidirectional",
  },
];

const healthySync: ShopifyMarketsSyncSettings = {
  lastDiscoveryAt: new Date().toISOString(),
  primaryShopifyMarketId: "gid://shopify/Market/1",
  discoveredMarkets: [{ id: "gid://shopify/Market/1", name: "EU", handle: "eu", enabled: true, primary: true, currencyCode: "EUR", regionCodes: ["DE"] }],
  discoveryError: null,
  requiredScopesNote: null,
  lastPriceImportAt: new Date().toISOString(),
  priceImportError: null,
  marketPriceImports: {},
  lastWebhookPriceImportAt: null,
  lastWebhookPriceImportTopic: null,
  lastWebhookPriceImportTriggeredAt: null,
  lastWebhookPriceImportSkippedReason: null,
  lastPricePushAt: null,
  lastPricePushError: null,
  lastPricePushTriggeredAt: null,
  lastPricePushSkippedReason: null,
  lastPricePushOrigin: null,
  marketPriceExports: {},
  lastBidirectionalReconcileAt: new Date().toISOString(),
  lastBidirectionalReconcileError: null,
  lastBidirectionalReconcileResult: "synced",
  marketPriceConflicts: {},
  lastCatalogImportAt: null,
  catalogImportError: null,
  marketCatalogImports: {},
  lastCatalogPushAt: null,
  lastCatalogPushError: null,
  lastCatalogPushTriggeredAt: null,
  lastCatalogPushSkippedReason: null,
  marketCatalogExports: {},
  lastCatalogReconcileAt: null,
  lastCatalogReconcileError: null,
  lastCatalogReconcileResult: null,
  marketCatalogConflicts: {},
  lastTaxImportAt: null,
  taxImportError: null,
  marketTaxImports: {},
  lastTaxReconcileAt: null,
  lastTaxReconcileError: null,
  lastTaxReconcileResult: null,
  marketTaxConflicts: {},
  lastHostnameImportAt: null,
  hostnameImportError: null,
  marketHostnameImports: {},
  lastHostnameReconcileAt: null,
  lastHostnameReconcileError: null,
  lastHostnameReconcileResult: null,
  marketHostnameConflicts: {},
  lastWebhookRegistrySyncAt: new Date().toISOString(),
  webhookRegistrySyncError: null,
  lastWebhookRegistryRegisterAt: null,
  lastWebhookRegistryRegisterError: null,
  lastWebhookRegistryDriftCount: 0,
  marketWebhookRegistry: {
    "markets/create": {
      topic: "markets/create",
      graphqlTopic: "MARKETS_CREATE",
      routeSegment: "markets-create",
      label: "Markets create",
      expectedCallbackUrl: "https://example.com/api/webhooks/shopify/markets-create",
      shopifySubscriptionId: "gid://shopify/WebhookSubscription/1",
      actualCallbackUrl: "https://example.com/api/webhooks/shopify/markets-create",
      registeredAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
      lastDeliveryAt: new Date().toISOString(),
      failureCount: 0,
      driftStatus: "ok",
    },
  },
  lastFullMarketsReconcileAt: null,
  lastFullMarketsReconcileResult: null,
  lastFullMarketsReconcileError: null,
  b2bAuthority: "kitchenos",
  b2bUnavailableReason: null,
  lastB2bImportAt: null,
  b2bImportError: null,
  b2bCompanyImports: {},
  lastB2bReconcileAt: null,
  lastB2bReconcileError: null,
  lastB2bReconcileResult: null,
  b2bCompanyConflicts: {},
  b2bCompanyLinks: {},
};

describe("shopify-markets-health-dashboard", () => {
  it("computes health score with deductions", () => {
    const score = computeMarketsHealthScore({
      openPriceConflicts: 1,
      openCatalogConflicts: 0,
      openTaxConflicts: 0,
      openHostnameConflicts: 0,
      openB2bConflicts: 0,
      webhookMissingOrWrong: 1,
      webhookStaleOrNever: 0,
      discoveryError: false,
      linkedMarketsWithoutDiscovery: false,
      discoveryStale: false,
      b2bUnavailable: false,
    });
    expect(score).toBe(65);
    expect(levelFromScore(score)).toBe("attention");
    expect(healthLevelLabel("healthy")).toBe("Healthy");
  });

  it("detects stale timestamps", () => {
    const now = Date.parse("2026-06-01T00:00:00.000Z");
    expect(isTimestampStale("2026-05-01T00:00:00.000Z", 7 * 24 * 60 * 60 * 1000, now)).toBe(true);
    expect(isTimestampStale("2026-05-31T00:00:00.000Z", 7 * 24 * 60 * 60 * 1000, now)).toBe(false);
  });
});

describe("shopify-markets-health-service", () => {
  it("builds healthy snapshot", () => {
    const snapshot = buildShopifyMarketsHealthSnapshot({
      syncSettings: healthySync,
      osMarkets,
      shopifyConnected: true,
    });

    expect(snapshot.overallScore).toBeGreaterThanOrEqual(85);
    expect(snapshot.linkedMarkets).toBe(1);
    expect(snapshot.domains).toHaveLength(7);
    expect(snapshot.domains.find((d) => d.key === "prices")?.level).toBe("healthy");
  });

  it("flags critical when conflicts exist", () => {
    const snapshot = buildShopifyMarketsHealthSnapshot({
      syncSettings: {
        ...healthySync,
        marketPriceConflicts: {
          k: {
            conflictKey: "k",
            osMarketId: "eu",
            shopifyMarketId: "gid://shopify/Market/1",
            productId: "p",
            externalVariantId: "v",
            shopifyAmount: "10",
            kitchenosAmount: "12",
            detectedAt: new Date().toISOString(),
            status: "open",
            priceAuthority: "manual",
          },
        },
        marketWebhookRegistry: {
          "products/update": {
            topic: "products/update",
            graphqlTopic: "PRODUCTS_UPDATE",
            routeSegment: "products-update",
            label: "Products update",
            expectedCallbackUrl: "https://example.com/x",
            shopifySubscriptionId: null,
            actualCallbackUrl: null,
            registeredAt: null,
            lastSyncedAt: new Date().toISOString(),
            lastDeliveryAt: null,
            failureCount: 0,
            driftStatus: "missing",
          },
        },
      },
      osMarkets,
      shopifyConnected: true,
    });

    expect(snapshot.openPriceConflicts).toBe(1);
    expect(snapshot.webhookDriftCount).toBeGreaterThan(0);
    expect(snapshot.overallLevel).not.toBe("healthy");
    expect(snapshot.recommendations.length).toBeGreaterThan(0);
  });
});
