import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

import {
  buildShopifyMarketCatalogConflictKey,
  countOpenShopifyMarketCatalogConflicts,
  detectShopifyMarketCatalogConflicts,
} from "@/services/integrations/shopify-markets-catalog-bidirectional-service";
import {
  effectiveCatalogProductIdsForMarket,
  listCatalogImportableStorefrontMarkets,
  mapExternalProductsToKitchenIds,
  parseShopifyMarketCatalogGraphQLResponse,
} from "@/services/integrations/shopify-market-catalog-service";
import { listCatalogPushableStorefrontMarkets } from "@/services/integrations/shopify-market-catalog-push-service";
import type { StorefrontMarket } from "@/lib/storefront/markets";
import { computeShopifyMarketCatalogHash } from "@/lib/storefront/revalidate-shopify-market-catalog";

const fixture = JSON.parse(
  readFileSync(join(process.cwd(), "tests/fixtures/shopify/market-catalog-response.json"), "utf8"),
);

const settingsCenter = {
  storefront: {
    markets: [
      {
        id: "us",
        name: "United States",
        currency: "USD",
        enabled: true,
        shopifyMarketId: "gid://shopify/Market/1",
        syncMode: "bidirectional",
        catalogAuthority: "manual",
      },
      {
        id: "ca-push",
        name: "Canada",
        currency: "CAD",
        enabled: true,
        shopifyMarketId: "gid://shopify/Market/2",
        syncMode: "push",
        productIds: ["aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"],
      },
      {
        id: "eu-import",
        name: "EU",
        currency: "EUR",
        enabled: true,
        shopifyMarketId: "gid://shopify/Market/3",
        syncMode: "import",
      },
    ] satisfies StorefrontMarket[],
  },
};

describe("shopify-market-catalog-service", () => {
  it("parses market catalog GraphQL fixture", () => {
    const parsed = parseShopifyMarketCatalogGraphQLResponse(fixture);
    expect(parsed.shopifyMarketId).toBe("gid://shopify/Market/8947691234567");
    expect(parsed.shopifyCatalogId).toBe("gid://shopify/Catalog/1234567890");
    expect(parsed.shopifyPublicationId).toBe("gid://shopify/Publication/9876543210");
    expect(parsed.externalProductIds).toEqual(["1111111111", "2222222222"]);
  });

  it("maps external product ids to KitchenOS product ids", () => {
    const mapped = mapExternalProductsToKitchenIds({
      externalProductIds: ["1111111111", "2222222222", "999"],
      externalToProductId: new Map([
        ["1111111111", "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"],
        ["2222222222", "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"],
      ]),
    });
    expect(mapped).toHaveLength(2);
  });

  it("lists importable and pushable catalog markets", () => {
    expect(listCatalogImportableStorefrontMarkets(settingsCenter)).toHaveLength(2);
    expect(listCatalogPushableStorefrontMarkets(settingsCenter)).toHaveLength(1);
  });

  it("resolves effective catalog product ids per RFC rules", () => {
    const importMarket: StorefrontMarket = {
      id: "eu-import",
      name: "EU",
      enabled: true,
      syncMode: "import",
      shopifyMarketId: "gid://shopify/Market/3",
    };
    expect(
      effectiveCatalogProductIdsForMarket({
        market: importMarket,
        catalogImportRow: {
          osMarketId: "eu-import",
          shopifyMarketId: "gid://shopify/Market/3",
          shopifyCatalogId: null,
          shopifyPublicationId: null,
          importedAt: "2026-05-31T12:00:00.000Z",
          externalProductCount: 1,
          mappedProductCount: 1,
          productIds: ["aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"],
          catalogHash: "abc",
        },
      }),
    ).toEqual(["aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"]);

    const configured: StorefrontMarket = {
      ...importMarket,
      productIds: ["cccccccc-cccc-cccc-cccc-cccccccccccc"],
    };
    expect(
      effectiveCatalogProductIdsForMarket({
        market: configured,
        catalogImportRow: null,
      }),
    ).toEqual(["cccccccc-cccc-cccc-cccc-cccccccccccc"]);
  });

  it("computes stable catalog hash", () => {
    const hash = computeShopifyMarketCatalogHash([
      "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    ]);
    expect(hash).toHaveLength(16);
  });
});

describe("shopify-markets-catalog-bidirectional-service", () => {
  it("detects catalog publication conflicts", () => {
    const productA = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
    const productB = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
    const { conflicts, detected } = detectShopifyMarketCatalogConflicts({
      markets: settingsCenter.storefront.markets,
      marketCatalogImports: {
        us: {
          osMarketId: "us",
          shopifyMarketId: "gid://shopify/Market/1",
          shopifyCatalogId: null,
          shopifyPublicationId: null,
          importedAt: "2026-05-31T12:00:00.000Z",
          externalProductCount: 2,
          mappedProductCount: 2,
          productIds: [productA, productB],
          catalogHash: "abc",
        },
      },
      kitchenosCatalogByMarket: new Map([["us", new Set([productA])]]),
      externalProductIdByProductId: new Map([
        [productA, "1111111111"],
        [productB, "2222222222"],
      ]),
      existingConflicts: {},
    });

    expect(detected).toBe(1);
    const key = buildShopifyMarketCatalogConflictKey("us", productB);
    expect(conflicts[key]?.shopifyPublished).toBe(true);
    expect(conflicts[key]?.kitchenosPublished).toBe(false);
    expect(countOpenShopifyMarketCatalogConflicts(conflicts)).toBe(1);
  });
});
