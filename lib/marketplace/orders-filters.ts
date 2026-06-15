import type { MarketplacePOStatus } from "@prisma/client";

import { MARKETPLACE_PO_STATUSES } from "@/lib/marketplace/order-status";

export type MarketplaceOrdersTab = "orders" | "po" | "recurring";

export type MarketplaceOrdersFilters = {
  tab: MarketplaceOrdersTab;
  status?: MarketplacePOStatus;
  vendorId?: string;
  dateFrom?: string;
  dateTo?: string;
  q?: string;
  page: number;
  pageSize: number;
};

const DEFAULT_PAGE_SIZE = 20;

export function parseMarketplaceOrdersFilters(
  searchParams: Record<string, string | string[] | undefined>,
): MarketplaceOrdersFilters {
  const tabRaw = pickString(searchParams.tab);
  const tab: MarketplaceOrdersTab =
    tabRaw === "po" || tabRaw === "recurring" ? tabRaw : "orders";

  const statusRaw = pickString(searchParams.status);
  const status = MARKETPLACE_PO_STATUSES.includes(statusRaw as MarketplacePOStatus)
    ? (statusRaw as MarketplacePOStatus)
    : undefined;

  const page = Math.max(1, Number(pickString(searchParams.page) ?? "1") || 1);

  return {
    tab,
    status,
    vendorId: pickString(searchParams.vendor) || undefined,
    dateFrom: pickString(searchParams.from) || undefined,
    dateTo: pickString(searchParams.to) || undefined,
    q: pickString(searchParams.q) || undefined,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
  };
}

export function marketplaceOrdersFiltersToQuery(
  filters: MarketplaceOrdersFilters,
): Record<string, string> {
  const query: Record<string, string> = {};
  if (filters.tab !== "orders") query.tab = filters.tab;
  if (filters.status) query.status = filters.status;
  if (filters.vendorId) query.vendor = filters.vendorId;
  if (filters.dateFrom) query.from = filters.dateFrom;
  if (filters.dateTo) query.to = filters.dateTo;
  if (filters.q) query.q = filters.q;
  if (filters.page > 1) query.page = String(filters.page);
  return query;
}

function pickString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}
