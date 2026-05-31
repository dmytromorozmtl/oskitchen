import { describe, expect, it } from "vitest";

import {
  buildShopifyMarketPriceConflictKey,
  countOpenShopifyMarketPriceConflicts,
  detectShopifyMarketPriceConflicts,
} from "@/services/integrations/shopify-markets-bidirectional-service";
import {
  listBidirectionalStorefrontMarkets,
  listPushableStorefrontMarkets,
} from "@/services/integrations/shopify-market-prices-push-service";
import { listImportableStorefrontMarkets } from "@/services/integrations/shopify-market-prices-service";
import type { StorefrontMarket } from "@/lib/storefront/markets";

const settingsCenter = {
  storefront: {
    markets: [
      {
        id: "ca",
        name: "Canada",
        currency: "CAD",
        enabled: true,
        shopifyMarketId: "gid://shopify/Market/1",
        syncMode: "bidirectional",
        priceAuthority: "manual",
      },
      {
        id: "us-push",
        name: "United States",
        currency: "USD",
        enabled: true,
        shopifyMarketId: "gid://shopify/Market/2",
        syncMode: "push",
      },
      {
        id: "us-import",
        name: "US Import",
        currency: "USD",
        enabled: true,
        shopifyMarketId: "gid://shopify/Market/3",
        syncMode: "import",
      },
    ] satisfies StorefrontMarket[],
  },
};

describe("shopify-markets-bidirectional-service", () => {
  it("lists importable and pushable markets including bidirectional rules", () => {
    expect(listImportableStorefrontMarkets(settingsCenter)).toHaveLength(2);
    expect(listBidirectionalStorefrontMarkets(settingsCenter)).toHaveLength(1);
    expect(listPushableStorefrontMarkets(settingsCenter)).toHaveLength(1);
  });

  it("detects price conflicts between Shopify imports and KitchenOS prices", () => {
    const { conflicts, detected } = detectShopifyMarketPriceConflicts({
      markets: settingsCenter.storefront.markets,
      marketPriceImports: {
        ca: {
          osMarketId: "ca",
          shopifyMarketId: "gid://shopify/Market/1",
          shopifyPriceListId: "gid://shopify/PriceList/1",
          currencyCode: "CAD",
          importedAt: "2026-05-31T12:00:00.000Z",
          variantCount: 2,
          mappedProductCount: 1,
          productPrices: {
            "11111111-1111-1111-1111-111111111111": "12.50",
          },
          priceHash: "abc",
        },
      },
      kitchenosPrices: new Map([
        ["11111111-1111-1111-1111-111111111111", "14.99"],
      ]),
      variantByProductId: new Map([
        ["11111111-1111-1111-1111-111111111111", "999"],
      ]),
      existingConflicts: {},
    });

    expect(detected).toBe(1);
    const key = buildShopifyMarketPriceConflictKey(
      "ca",
      "11111111-1111-1111-1111-111111111111",
    );
    expect(conflicts[key]?.shopifyAmount).toBe("12.50");
    expect(conflicts[key]?.kitchenosAmount).toBe("14.99");
    expect(conflicts[key]?.priceAuthority).toBe("manual");
    expect(countOpenShopifyMarketPriceConflicts(conflicts)).toBe(1);
  });

  it("clears open conflicts when prices match after reconcile", () => {
    const key = buildShopifyMarketPriceConflictKey(
      "ca",
      "11111111-1111-1111-1111-111111111111",
    );
    const { conflicts, detected } = detectShopifyMarketPriceConflicts({
      markets: settingsCenter.storefront.markets,
      marketPriceImports: {
        ca: {
          osMarketId: "ca",
          shopifyMarketId: "gid://shopify/Market/1",
          shopifyPriceListId: null,
          currencyCode: "CAD",
          importedAt: "2026-05-31T12:00:00.000Z",
          variantCount: 1,
          mappedProductCount: 1,
          productPrices: {
            "11111111-1111-1111-1111-111111111111": "14.99",
          },
          priceHash: "def",
        },
      },
      kitchenosPrices: new Map([
        ["11111111-1111-1111-1111-111111111111", "14.99"],
      ]),
      variantByProductId: new Map([
        ["11111111-1111-1111-1111-111111111111", "999"],
      ]),
      existingConflicts: {
        [key]: {
          conflictKey: key,
          osMarketId: "ca",
          shopifyMarketId: "gid://shopify/Market/1",
          productId: "11111111-1111-1111-1111-111111111111",
          externalVariantId: "999",
          shopifyAmount: "12.50",
          kitchenosAmount: "14.99",
          detectedAt: "2026-05-31T11:00:00.000Z",
          status: "open",
          priceAuthority: "manual",
        },
      },
    });

    expect(detected).toBe(0);
    expect(conflicts[key]).toBeUndefined();
  });
});
