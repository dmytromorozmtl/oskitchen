import { describe, expect, it } from "vitest";

import {
  isLikelyGtinQuery,
  parseMarketplaceCompareFilters,
} from "@/lib/marketplace/compare-filters";

describe("marketplace compare filters", () => {
  it("parses search query, product slugs, and sort", () => {
    const filters = parseMarketplaceCompareFilters({
      q: "olive oil",
      products: "sku-a,sku-b,sku-a",
      sort: "rating_desc",
    });
    expect(filters.q).toBe("olive oil");
    expect(filters.products).toEqual(["sku-a", "sku-b"]);
    expect(filters.sort).toBe("rating_desc");
  });

  it("defaults sort to price ascending", () => {
    expect(parseMarketplaceCompareFilters({}).sort).toBe("price_asc");
  });

  it("detects GTIN-shaped queries", () => {
    expect(isLikelyGtinQuery("00812345678905")).toBe(true);
    expect(isLikelyGtinQuery("olive oil")).toBe(false);
  });
});
