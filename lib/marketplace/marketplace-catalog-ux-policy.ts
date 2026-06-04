import {
  marketplaceCatalogFiltersToQuery,
  MARKETPLACE_CATALOG_SORT_OPTIONS,
  type MarketplaceCatalogFilters,
  type MarketplaceCatalogVendorOption,
} from "@/lib/marketplace/catalog-filters";

/**
 * DES-16 — marketplace catalog filter / compare / wishlist UX policy.
 *
 * @see components/marketplace/marketplace-catalog-toolbar.tsx
 */

export const MARKETPLACE_CATALOG_UX_POLICY_ID = "marketplace-catalog-ux-des16-v1" as const;

export const MARKETPLACE_CATALOG_PATH = "/dashboard/marketplace/catalog" as const;
export const MARKETPLACE_COMPARE_PATH = "/dashboard/marketplace/compare" as const;
export const MARKETPLACE_WISHLIST_PATH = "/dashboard/marketplace/wishlist" as const;

export const MARKETPLACE_COMPARE_STORAGE_KEY = "marketplace-compare-slugs" as const;
export const MARKETPLACE_COMPARE_LIMIT = 4 as const;
export const MARKETPLACE_WISHLIST_KEY = "marketplace-wishlist-slugs" as const;

export const MARKETPLACE_CATALOG_TOOLBAR_TEST_ID = "marketplace-catalog-toolbar" as const;

export const MARKETPLACE_CATALOG_UX_MODULES = [
  "components/marketplace/marketplace-catalog-toolbar.tsx",
  "components/marketplace/catalog-filter-bar.tsx",
  "components/marketplace/marketplace-catalog-product-card.tsx",
  "app/dashboard/marketplace/wishlist/page.tsx",
  "app/dashboard/marketplace/compare/page.tsx",
] as const;

export type MarketplaceCatalogFilterChip = {
  key: keyof MarketplaceCatalogFilters;
  label: string;
  href: string;
};

function catalogHref(filters: MarketplaceCatalogFilters): string {
  const query = marketplaceCatalogFiltersToQuery({ ...filters, page: 1 });
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value != null && value !== "") params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `${MARKETPLACE_CATALOG_PATH}?${qs}` : MARKETPLACE_CATALOG_PATH;
}

function sortLabel(sort: MarketplaceCatalogFilters["sort"]): string {
  return (
    MARKETPLACE_CATALOG_SORT_OPTIONS.find((option) => option.value === sort)?.label ?? sort
  );
}

export function buildMarketplaceCompareHref(slugs: readonly string[]): string {
  if (slugs.length === 0) return MARKETPLACE_COMPARE_PATH;
  const params = new URLSearchParams();
  params.set("products", slugs.join(","));
  return `${MARKETPLACE_COMPARE_PATH}?${params.toString()}`;
}

export function buildMarketplaceCatalogFilterChips(
  filters: MarketplaceCatalogFilters,
  options: {
    vendors?: readonly MarketplaceCatalogVendorOption[];
    categoryNames?: ReadonlyMap<string, string>;
  } = {},
): MarketplaceCatalogFilterChip[] {
  const chips: MarketplaceCatalogFilterChip[] = [];
  const vendors = options.vendors ?? [];
  const categoryNames = options.categoryNames ?? new Map<string, string>();

  if (filters.q.trim()) {
    chips.push({
      key: "q",
      label: `Search: ${filters.q.trim()}`,
      href: catalogHref({ ...filters, q: "" }),
    });
  }

  if (filters.category.trim()) {
    const name = categoryNames.get(filters.category) ?? filters.category;
    chips.push({
      key: "category",
      label: `Category: ${name}`,
      href: catalogHref({ ...filters, category: "" }),
    });
  }

  if (filters.vendorId.trim()) {
    const vendor =
      vendors.find((row) => row.id === filters.vendorId)?.companyName ?? filters.vendorId;
    chips.push({
      key: "vendorId",
      label: `Vendor: ${vendor}`,
      href: catalogHref({ ...filters, vendorId: "" }),
    });
  }

  if (filters.minPrice != null) {
    chips.push({
      key: "minPrice",
      label: `Min $${filters.minPrice}`,
      href: catalogHref({ ...filters, minPrice: undefined }),
    });
  }

  if (filters.maxPrice != null) {
    chips.push({
      key: "maxPrice",
      label: `Max $${filters.maxPrice}`,
      href: catalogHref({ ...filters, maxPrice: undefined }),
    });
  }

  if (filters.minRating != null) {
    chips.push({
      key: "minRating",
      label: `Rating ≥ ${filters.minRating}`,
      href: catalogHref({ ...filters, minRating: undefined }),
    });
  }

  if (filters.maxLeadDays != null) {
    chips.push({
      key: "maxLeadDays",
      label: `Delivery ≤ ${filters.maxLeadDays}d`,
      href: catalogHref({ ...filters, maxLeadDays: undefined }),
    });
  }

  if (filters.maxMoq != null) {
    chips.push({
      key: "maxMoq",
      label: `MOQ ≤ ${filters.maxMoq}`,
      href: catalogHref({ ...filters, maxMoq: undefined }),
    });
  }

  if (filters.inStockOnly) {
    chips.push({
      key: "inStockOnly",
      label: "In stock only",
      href: catalogHref({ ...filters, inStockOnly: false }),
    });
  }

  if (filters.sort !== "popularity") {
    chips.push({
      key: "sort",
      label: `Sort: ${sortLabel(filters.sort)}`,
      href: catalogHref({ ...filters, sort: "popularity" }),
    });
  }

  return chips;
}

export function countMarketplaceCatalogFilterChips(
  filters: MarketplaceCatalogFilters,
  options?: Parameters<typeof buildMarketplaceCatalogFilterChips>[1],
): number {
  return buildMarketplaceCatalogFilterChips(filters, options).length;
}

export const MARKETPLACE_CATALOG_TRAY_STORAGE_KEYS = [
  MARKETPLACE_COMPARE_STORAGE_KEY,
  MARKETPLACE_WISHLIST_KEY,
] as const;

export const MARKETPLACE_WISHLIST_CHANGE_EVENT = "marketplace-wishlist-change" as const;
export const MARKETPLACE_COMPARE_CHANGE_EVENT = "marketplace-compare-change" as const;

export function dispatchMarketplaceCatalogTrayChange(
  eventName:
    | typeof MARKETPLACE_WISHLIST_CHANGE_EVENT
    | typeof MARKETPLACE_COMPARE_CHANGE_EVENT,
): void {
  if (typeof window === "undefined") return;
  if (typeof window.dispatchEvent !== "function") return;
  window.dispatchEvent(new CustomEvent(eventName));
}
