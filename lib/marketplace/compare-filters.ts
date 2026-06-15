export const MARKETPLACE_COMPARE_SORT_OPTIONS = [
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "rating_desc", label: "Vendor rating" },
  { value: "delivery_asc", label: "Fastest delivery" },
  { value: "moq_asc", label: "Lowest MOQ" },
] as const;

export type MarketplaceCompareSort =
  (typeof MARKETPLACE_COMPARE_SORT_OPTIONS)[number]["value"];

export type MarketplaceCompareFilters = {
  q: string;
  products: string[];
  sort: MarketplaceCompareSort;
};

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function parseSort(raw: string): MarketplaceCompareSort {
  const allowed = new Set(MARKETPLACE_COMPARE_SORT_OPTIONS.map((option) => option.value));
  if (allowed.has(raw as MarketplaceCompareSort)) {
    return raw as MarketplaceCompareSort;
  }
  return "price_asc";
}

function parseProductSlugs(raw: string): string[] {
  if (!raw.trim()) return [];
  return [...new Set(raw.split(",").map((slug) => slug.trim()).filter(Boolean))].slice(0, 12);
}

export function parseMarketplaceCompareFilters(
  searchParams: Record<string, string | string[] | undefined>,
): MarketplaceCompareFilters {
  return {
    q: firstParam(searchParams.q).trim(),
    products: parseProductSlugs(firstParam(searchParams.products)),
    sort: parseSort(firstParam(searchParams.sort)),
  };
}

export function marketplaceCompareFiltersToQuery(
  filters: MarketplaceCompareFilters,
): Record<string, string | undefined> {
  return {
    q: filters.q || undefined,
    products: filters.products.length > 0 ? filters.products.join(",") : undefined,
    sort: filters.sort === "price_asc" ? undefined : filters.sort,
  };
}

export function isLikelyGtinQuery(query: string): boolean {
  const normalized = query.replace(/\s+/g, "");
  return /^\d{8,14}$/.test(normalized);
}
