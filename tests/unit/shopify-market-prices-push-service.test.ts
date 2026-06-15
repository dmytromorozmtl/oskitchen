import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

import {
  mergeShopifyMarketsSyncSettings,
  parseShopifyMarketsSyncSettings,
} from "@/lib/integrations/shopify-markets-settings";
import { toShopifyPriceListGid, toShopifyVariantGid } from "@/services/integrations/shopify-market-prices-service";
import {
  buildPushPricesForMarket,
  computeShopifyMarketPushPriceHash,
  isShopifyMarketsPushDebounced,
  parseShopifyPriceListFixedPricesUpdateResponse,
  SHOPIFY_MARKETS_PUSH_DEBOUNCE_MS,
} from "@/services/integrations/shopify-market-prices-push-service";

const pushFixture = JSON.parse(
  readFileSync(join(process.cwd(), "tests/fixtures/shopify/market-prices-push-response.json"), "utf8"),
);

describe("shopify-market-prices-push-service", () => {
  it("normalizes Shopify GIDs for variants and price lists", () => {
    expect(toShopifyVariantGid("4455667788")).toBe("gid://shopify/ProductVariant/4455667788");
    expect(toShopifyPriceListGid("gid://shopify/PriceList/987654")).toBe(
      "gid://shopify/PriceList/987654",
    );
  });

  it("builds push prices from mapped external variants and KitchenOS product prices", () => {
    const prices = buildPushPricesForMarket({
      market: {
        id: "ca",
        name: "Canada",
        currency: "cad",
        shopifyMarketId: "gid://shopify/Market/1",
        syncMode: "push",
      },
      externalProducts: [
        { externalVariantId: "4455667788", mappedProductId: "product-a" },
        { externalVariantId: "4455667799", mappedProductId: "product-b" },
        { externalVariantId: "999", mappedProductId: null },
      ],
      productPrices: new Map([
        ["product-a", "14.99"],
        ["product-b", "12.50"],
      ]),
    });

    expect(prices).toHaveLength(2);
    expect(prices[0]?.amount).toBe("14.99");
    expect(prices[0]?.currencyCode).toBe("CAD");
    expect(prices[0]?.variantGid).toContain("ProductVariant/4455667788");
  });

  it("computes stable outgoing push hash", () => {
    const rows = [
      { variantGid: "gid://shopify/ProductVariant/2", amount: "10.00" },
      { variantGid: "gid://shopify/ProductVariant/1", amount: "9.00" },
    ];
    const a = computeShopifyMarketPushPriceHash(rows);
    const b = computeShopifyMarketPushPriceHash([...rows].reverse());
    expect(a).toBe(b);
    expect(a).toHaveLength(16);
  });

  it("debounces push within 30 seconds", () => {
    const now = Date.parse("2026-05-31T12:00:00.000Z");
    expect(isShopifyMarketsPushDebounced("2026-05-31T11:59:45.000Z", now)).toBe(true);
    expect(isShopifyMarketsPushDebounced("2026-05-31T11:59:00.000Z", now)).toBe(false);
    expect(SHOPIFY_MARKETS_PUSH_DEBOUNCE_MS).toBe(30_000);
  });

  it("parses priceListFixedPricesUpdate GraphQL fixture", () => {
    const parsed = parseShopifyPriceListFixedPricesUpdateResponse(pushFixture);
    expect(parsed.priceListId).toContain("PriceList/");
    expect(parsed.userErrors).toEqual([]);
  });

  it("persists push export metadata in connection settings", () => {
    const settings = mergeShopifyMarketsSyncSettings({}, {
      lastPricePushAt: "2026-05-31T12:00:00.000Z",
      lastPricePushOrigin: "manual",
      marketPriceExports: {
        ca: {
          osMarketId: "ca",
          shopifyMarketId: "gid://shopify/Market/1",
          shopifyPriceListId: "gid://shopify/PriceList/1",
          currencyCode: "CAD",
          pushedAt: "2026-05-31T12:00:00.000Z",
          variantCount: 2,
          pushedVariantCount: 2,
          priceHash: "abc123def4567890",
        },
      },
    });
    const parsed = parseShopifyMarketsSyncSettings(settings);
    expect(parsed.lastPricePushOrigin).toBe("manual");
    expect(parsed.marketPriceExports.ca?.pushedVariantCount).toBe(2);
  });
});
