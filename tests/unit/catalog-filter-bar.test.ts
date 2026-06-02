import { describe, expect, it } from "vitest";

import { countActiveCatalogFilters } from "@/components/marketplace/catalog-filter-bar";
import type { MarketplaceCatalogFilters } from "@/lib/marketplace/catalog-filters";

const BASE: MarketplaceCatalogFilters = {
  q: "",
  category: "",
  vendorId: "",
  inStockOnly: false,
  sort: "popularity",
  page: 1,
};

describe("countActiveCatalogFilters", () => {
  it("returns zero for default filters", () => {
    expect(countActiveCatalogFilters(BASE)).toBe(0);
  });

  it("counts search, vendor, price, and sort overrides", () => {
    expect(
      countActiveCatalogFilters({
        ...BASE,
        q: "olive oil",
        vendorId: "v1",
        minPrice: 10,
        maxPrice: 50,
        sort: "price_asc",
        inStockOnly: true,
      }),
    ).toBe(6);
  });

  it("counts category slug when set", () => {
    expect(countActiveCatalogFilters({ ...BASE, category: "dry-goods" })).toBe(1);
  });
});
