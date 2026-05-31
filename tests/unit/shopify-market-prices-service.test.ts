import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

import {
  mergeShopifyMarketsSyncSettings,
  parseShopifyMarketsSyncSettings,
} from "@/lib/integrations/shopify-markets-settings";
import {
  mergeVariantPricesIntoProductMap,
  parseShopifyMarketPricesGraphQLResponse,
} from "@/services/integrations/shopify-market-prices-service";

const fixture = JSON.parse(
  readFileSync(join(process.cwd(), "tests/fixtures/shopify/market-prices-response.json"), "utf8"),
);

describe("shopify-market-prices-service", () => {
  it("parses market price list GraphQL fixture", () => {
    const parsed = parseShopifyMarketPricesGraphQLResponse(fixture);
    expect(parsed.shopifyMarketId).toContain("Market/");
    expect(parsed.priceListId).toContain("PriceList/");
    expect(parsed.prices).toHaveLength(2);
    expect(parsed.prices[0]?.currencyCode).toBe("CAD");
    expect(parsed.prices[0]?.externalVariantId).toBe("4455667788");
  });

  it("merges variant prices to lowest mapped product price", () => {
    const parsed = parseShopifyMarketPricesGraphQLResponse(fixture);
    const variantToProduct = new Map<string, string>([
      ["4455667788", "product-a"],
      ["4455667799", "product-b"],
    ]);

    const merged = mergeVariantPricesIntoProductMap(parsed.prices, variantToProduct);
    expect(merged["product-a"]).toBe("14.99");
    expect(merged["product-b"]).toBe("12.50");
  });

  it("persists market price imports in connection settings", () => {
    const settings = mergeShopifyMarketsSyncSettings(
      { apiVersion: "2025-01" },
      {
        lastPriceImportAt: "2026-05-31T10:00:00.000Z",
        marketPriceImports: {
          ca: {
            osMarketId: "ca",
            shopifyMarketId: "gid://shopify/Market/1",
            shopifyPriceListId: "gid://shopify/PriceList/1",
            currencyCode: "CAD",
            importedAt: "2026-05-31T10:00:00.000Z",
            variantCount: 2,
            mappedProductCount: 1,
            productPrices: { "11111111-1111-1111-1111-111111111111": "14.99" },
          },
        },
      },
    );
    const parsed = parseShopifyMarketsSyncSettings(settings);
    expect(parsed.lastPriceImportAt).toBe("2026-05-31T10:00:00.000Z");
    expect(parsed.marketPriceImports.ca?.mappedProductCount).toBe(1);
  });
});
