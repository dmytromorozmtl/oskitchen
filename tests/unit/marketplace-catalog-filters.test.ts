import { describe, expect, it } from "vitest";

import {
  buildMarketplaceCategoryTree,
  parseMarketplaceCatalogFilters,
} from "@/lib/marketplace/catalog-filters";

describe("marketplace catalog filters", () => {
  it("parses catalog search params with defaults", () => {
    expect(parseMarketplaceCatalogFilters({})).toEqual({
      q: "",
      category: "",
      vendorId: "",
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
      maxLeadDays: undefined,
      maxMoq: undefined,
      inStockOnly: false,
      sort: "popularity",
      page: 1,
    });
  });

  it("parses filter values from query string", () => {
    expect(
      parseMarketplaceCatalogFilters({
        q: "gloves",
        category: "packaging-disposables",
        vendor: "vendor-1",
        minPrice: "10",
        maxPrice: "100",
        minRating: "4",
        maxLeadDays: "5",
        maxMoq: "12",
        inStock: "1",
        sort: "price_asc",
        page: "2",
      }),
    ).toMatchObject({
      q: "gloves",
      category: "packaging-disposables",
      vendorId: "vendor-1",
      minPrice: 10,
      maxPrice: 100,
      minRating: 4,
      maxLeadDays: 5,
      maxMoq: 12,
      inStockOnly: true,
      sort: "price_asc",
      page: 2,
    });
  });

  it("builds a nested category tree", () => {
    const tree = buildMarketplaceCategoryTree([
      {
        id: "1",
        name: "Packaging",
        slug: "packaging-disposables",
        level: 1,
        parentId: null,
        sortOrder: 0,
      },
      {
        id: "2",
        name: "Gloves",
        slug: "packaging-disposables-gloves",
        level: 2,
        parentId: "1",
        sortOrder: 0,
      },
    ]);

    expect(tree).toHaveLength(1);
    expect(tree[0]?.children).toHaveLength(1);
    expect(tree[0]?.children[0]?.slug).toBe("packaging-disposables-gloves");
  });
});
