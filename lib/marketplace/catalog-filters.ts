export const MARKETPLACE_CATALOG_PAGE_SIZE = 24;

export const MARKETPLACE_CATALOG_SORT_OPTIONS = [
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "rating_desc", label: "Vendor rating" },
  { value: "newest", label: "Newest" },
  { value: "popularity", label: "Popularity" },
] as const;

export type MarketplaceCatalogSort =
  (typeof MARKETPLACE_CATALOG_SORT_OPTIONS)[number]["value"];

export type MarketplaceCatalogFilters = {
  q: string;
  category: string;
  vendorId: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  maxLeadDays?: number;
  maxMoq?: number;
  inStockOnly: boolean;
  sort: MarketplaceCatalogSort;
  page: number;
};

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function parseNumber(raw: string): number | undefined {
  if (!raw.trim()) return undefined;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) return undefined;
  return value;
}

function parsePage(raw: string): number {
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 1) return 1;
  return Math.floor(value);
}

function parseSort(raw: string): MarketplaceCatalogSort {
  const allowed = new Set(MARKETPLACE_CATALOG_SORT_OPTIONS.map((option) => option.value));
  if (allowed.has(raw as MarketplaceCatalogSort)) {
    return raw as MarketplaceCatalogSort;
  }
  return "popularity";
}

export function parseMarketplaceCatalogFilters(
  searchParams: Record<string, string | string[] | undefined>,
): MarketplaceCatalogFilters {
  return {
    q: firstParam(searchParams.q).trim(),
    category: firstParam(searchParams.category).trim(),
    vendorId: firstParam(searchParams.vendor).trim(),
    minPrice: parseNumber(firstParam(searchParams.minPrice)),
    maxPrice: parseNumber(firstParam(searchParams.maxPrice)),
    minRating: parseNumber(firstParam(searchParams.minRating)),
    maxLeadDays: parseNumber(firstParam(searchParams.maxLeadDays)),
    maxMoq: parseNumber(firstParam(searchParams.maxMoq)),
    inStockOnly: firstParam(searchParams.inStock) === "1",
    sort: parseSort(firstParam(searchParams.sort)),
    page: parsePage(firstParam(searchParams.page)),
  };
}

export function marketplaceCatalogFiltersToQuery(
  filters: MarketplaceCatalogFilters,
): Record<string, string | undefined> {
  return {
    q: filters.q || undefined,
    category: filters.category || undefined,
    vendor: filters.vendorId || undefined,
    minPrice: filters.minPrice != null ? String(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice != null ? String(filters.maxPrice) : undefined,
    minRating: filters.minRating != null ? String(filters.minRating) : undefined,
    maxLeadDays: filters.maxLeadDays != null ? String(filters.maxLeadDays) : undefined,
    maxMoq: filters.maxMoq != null ? String(filters.maxMoq) : undefined,
    inStock: filters.inStockOnly ? "1" : undefined,
    sort: filters.sort !== "popularity" ? filters.sort : undefined,
    page: filters.page > 1 ? String(filters.page) : undefined,
  };
}

export type MarketplaceCatalogCategoryNode = {
  id: string;
  name: string;
  slug: string;
  level: number;
  children: MarketplaceCatalogCategoryNode[];
};

export function buildMarketplaceCategoryTree(
  rows: readonly {
    id: string;
    name: string;
    slug: string;
    level: number;
    parentId: string | null;
    sortOrder: number;
  }[],
): MarketplaceCatalogCategoryNode[] {
  const byId = new Map<string, MarketplaceCatalogCategoryNode>();
  for (const row of rows) {
    byId.set(row.id, {
      id: row.id,
      name: row.name,
      slug: row.slug,
      level: row.level,
      children: [],
    });
  }

  const roots: MarketplaceCatalogCategoryNode[] = [];
  for (const row of rows) {
    const node = byId.get(row.id);
    if (!node) continue;
    if (row.parentId && byId.has(row.parentId)) {
      byId.get(row.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (nodes: MarketplaceCatalogCategoryNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    for (const node of nodes) sortNodes(node.children);
  };
  sortNodes(roots);
  return roots;
}
