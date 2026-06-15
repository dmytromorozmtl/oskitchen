import { describe, expect, it } from "vitest";

import {
  hostLabelsMatch,
  normalizeShopifyHandleToHostLabel,
  suggestMarketHostSubdomain,
  suggestMarketStoreSlug,
} from "@/lib/commercial/shopify-market-hostname-guard";
import { computeShopifyMarketHostnameHash } from "@/lib/storefront/revalidate-shopify-market-hostname";
import type { StorefrontMarket } from "@/lib/storefront/markets";
import {
  buildShopifyMarketHostnameConflictKey,
  detectShopifyMarketHostnameConflicts,
} from "@/services/integrations/shopify-markets-hostname-guard-bidirectional-service";
import {
  buildHostnameImportRow,
  listHostnameGuardStorefrontMarkets,
} from "@/services/integrations/shopify-market-hostname-service";

const settingsCenter = {
  storefront: {
    markets: [
      {
        id: "eu",
        name: "Europe",
        currency: "EUR",
        enabled: true,
        shopifyMarketId: "gid://shopify/Market/2",
        syncMode: "import",
        hostSubdomain: "hello-us",
        hostnameAuthority: "manual",
      },
      {
        id: "ca",
        name: "Canada",
        currency: "CAD",
        enabled: true,
        shopifyMarketId: "gid://shopify/Market/3",
        syncMode: "bidirectional",
      },
    ] satisfies StorefrontMarket[],
  },
};

describe("shopify-market-hostname-guard", () => {
  it("normalizes Shopify handles to host labels", () => {
    expect(normalizeShopifyHandleToHostLabel("United States", "us")).toBe("united-states");
    expect(normalizeShopifyHandleToHostLabel("eu-market", "eu")).toBe("eu-market");
  });

  it("suggests composite host subdomains from handle", () => {
    expect(
      suggestMarketHostSubdomain({
        storeSlug: "hello",
        osMarketId: "eu",
        shopifyHandle: "europe",
      }),
    ).toBe("hello-europe");
  });

  it("suggests vanity store slug from handle", () => {
    expect(
      suggestMarketStoreSlug({
        primaryStoreSlug: "hello",
        shopifyHandle: "europe",
        osMarketId: "eu",
      }),
    ).toBe("hello-europe");
  });

  it("lists hostname guard markets", () => {
    expect(listHostnameGuardStorefrontMarkets(settingsCenter)).toHaveLength(2);
  });

  it("builds stable hostname hash", () => {
    const row = buildHostnameImportRow({
      market: settingsCenter.storefront.markets[0]!,
      primaryStoreSlug: "hello",
      shopifyHandle: "europe",
      shopifyMarketId: "gid://shopify/Market/2",
      importedAt: new Date().toISOString(),
    });
    expect(row.suggestedHostSubdomain).toBe("hello-europe");
    expect(row.hostnameHash).toHaveLength(16);
    expect(
      computeShopifyMarketHostnameHash({
        shopifyHandle: "europe",
        suggestedHostSubdomain: row.suggestedHostSubdomain,
        suggestedStoreSlug: row.suggestedStoreSlug,
      }),
    ).toBe(row.hostnameHash);
  });

  it("detects hostname conflicts", () => {
    const importRow = buildHostnameImportRow({
      market: settingsCenter.storefront.markets[0]!,
      primaryStoreSlug: "hello",
      shopifyHandle: "europe",
      shopifyMarketId: "gid://shopify/Market/2",
      importedAt: new Date().toISOString(),
    });

    const { conflicts, detected } = detectShopifyMarketHostnameConflicts({
      markets: settingsCenter.storefront.markets,
      marketHostnameImports: { eu: importRow },
      takenHostSubdomains: new Set(["hello-europe"]),
      publishedStoreSlugs: new Set(["hello-europe"]),
      primaryStoreSlug: "hello",
      existingConflicts: {},
    });

    expect(detected).toBeGreaterThan(0);
    expect(conflicts[buildShopifyMarketHostnameConflictKey("eu", "HANDLE_MISMATCH")]).toBeDefined();
    expect(hostLabelsMatch("hello-us", "hello-europe")).toBe(false);
  });
});
