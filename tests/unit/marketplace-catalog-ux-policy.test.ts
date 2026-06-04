import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  buildMarketplaceCatalogFilterChips,
  buildMarketplaceCompareHref,
  countMarketplaceCatalogFilterChips,
  MARKETPLACE_CATALOG_UX_POLICY_ID,
  MARKETPLACE_CATALOG_TOOLBAR_TEST_ID,
  MARKETPLACE_COMPARE_LIMIT,
} from "@/lib/marketplace/marketplace-catalog-ux-policy";
import { parseMarketplaceCatalogFilters } from "@/lib/marketplace/catalog-filters";
import {
  readMarketplaceCompareSlugs,
  toggleMarketplaceCompareSlug,
  writeMarketplaceCompareSlugs,
} from "@/lib/marketplace/marketplace-compare-storage";

const ROOT = process.cwd();

describe("marketplace catalog UX policy (DES-16)", () => {
  it("locks DES-16 policy id and compare limit", () => {
    expect(MARKETPLACE_CATALOG_UX_POLICY_ID).toBe("marketplace-catalog-ux-des16-v1");
    expect(MARKETPLACE_COMPARE_LIMIT).toBe(4);
  });

  it("builds compare href from slugs", () => {
    expect(buildMarketplaceCompareHref(["a", "b"])).toBe(
      "/dashboard/marketplace/compare?products=a%2Cb",
    );
    expect(buildMarketplaceCompareHref([])).toBe("/dashboard/marketplace/compare");
  });

  it("builds removable filter chips with reset hrefs", () => {
    const filters = parseMarketplaceCatalogFilters({
      q: "gloves",
      vendor: "v1",
      minPrice: "10",
      inStock: "1",
      sort: "price_asc",
    });
    const chips = buildMarketplaceCatalogFilterChips(filters, {
      vendors: [{ id: "v1", companyName: "PackPro" }],
    });
    expect(chips.length).toBeGreaterThanOrEqual(4);
    expect(chips.find((chip) => chip.key === "q")?.label).toContain("gloves");
    expect(chips.find((chip) => chip.key === "vendorId")?.label).toContain("PackPro");
    expect(chips.find((chip) => chip.key === "q")?.href).not.toContain("q=gloves");
    expect(countMarketplaceCatalogFilterChips(filters, { vendors: [{ id: "v1", companyName: "PackPro" }] }))
      .toBe(chips.length);
  });

  it("persists compare slugs in sessionStorage with limit", () => {
    const store: Record<string, string> = {};
    const sessionStorage = {
      getItem(key: string) {
        return store[key] ?? null;
      },
      setItem(key: string, value: string) {
        store[key] = value;
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).window = {
      sessionStorage,
      dispatchEvent: () => {},
    };

    writeMarketplaceCompareSlugs(["a", "b", "c", "d", "e"]);
    expect(readMarketplaceCompareSlugs()).toHaveLength(4);
    expect(toggleMarketplaceCompareSlug("a").compared).toBe(false);
    expect(readMarketplaceCompareSlugs()).not.toContain("a");
  });

  it("ships catalog toolbar wired on catalog page", () => {
    const catalogPage = readFileSync(
      join(ROOT, "app/dashboard/marketplace/catalog/page.tsx"),
      "utf8",
    );
    const toolbar = readFileSync(
      join(ROOT, "components/marketplace/marketplace-catalog-toolbar.tsx"),
      "utf8",
    );
    expect(catalogPage).toContain("MarketplaceCatalogToolbar");
    expect(toolbar).toContain("MARKETPLACE_CATALOG_TOOLBAR_TEST_ID");
    expect(toolbar).toContain("marketplace-catalog-compare-link");
    expect(toolbar).toContain("marketplace-catalog-wishlist-link");
    expect(toolbar).toContain("marketplace-catalog-filter-chips");
  });
});
