import type { MarketplaceProductStatus } from "@prisma/client";

export type PlatformProductAdminFilters = {
  tab: "all" | "queue" | "flagged";
  status?: MarketplaceProductStatus;
  categoryId?: string;
  q?: string;
  page: number;
  pageSize: number;
};

const STATUSES: MarketplaceProductStatus[] = [
  "DRAFT",
  "PENDING_REVIEW",
  "ACTIVE",
  "OUT_OF_STOCK",
  "ARCHIVED",
];

export function parsePlatformProductAdminFilters(
  searchParams: Record<string, string | string[] | undefined>,
): PlatformProductAdminFilters {
  const tabRaw = pickString(searchParams.tab);
  const tab: PlatformProductAdminFilters["tab"] =
    tabRaw === "queue" ? "queue" : tabRaw === "flagged" ? "flagged" : "all";

  const statusRaw = pickString(searchParams.status);
  const status = STATUSES.includes(statusRaw as MarketplaceProductStatus)
    ? (statusRaw as MarketplaceProductStatus)
    : undefined;

  return {
    tab,
    status: tab === "queue" ? status : status,
    categoryId: pickString(searchParams.category) || undefined,
    q: pickString(searchParams.q) || undefined,
    page: Math.max(1, Number(pickString(searchParams.page) ?? "1") || 1),
    pageSize: 20,
  };
}

export function platformProductAdminFiltersToQuery(
  filters: PlatformProductAdminFilters,
): Record<string, string> {
  const query: Record<string, string> = {};
  if (filters.tab !== "all") query.tab = filters.tab;
  if (filters.status) query.status = filters.status;
  if (filters.categoryId) query.category = filters.categoryId;
  if (filters.q) query.q = filters.q;
  if (filters.page > 1) query.page = String(filters.page);
  return query;
}

function pickString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}
