import type { MarketplacePOStatus } from "@prisma/client";

import { MARKETPLACE_PO_STATUSES } from "@/lib/marketplace/order-status";

export type VendorOrdersFilters = {
  status?: MarketplacePOStatus;
  dateFrom?: string;
  dateTo?: string;
  q?: string;
  page: number;
  pageSize: number;
};

const DEFAULT_PAGE_SIZE = 20;

export function parseVendorOrdersFilters(
  searchParams: Record<string, string | string[] | undefined>,
): VendorOrdersFilters {
  const statusRaw = pickString(searchParams.status);
  const status = MARKETPLACE_PO_STATUSES.includes(statusRaw as MarketplacePOStatus)
    ? (statusRaw as MarketplacePOStatus)
    : undefined;

  const page = Math.max(1, Number(pickString(searchParams.page) ?? "1") || 1);

  return {
    status,
    dateFrom: pickString(searchParams.from) || undefined,
    dateTo: pickString(searchParams.to) || undefined,
    q: pickString(searchParams.q) || undefined,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
  };
}

export function vendorOrdersFiltersToQuery(filters: VendorOrdersFilters): Record<string, string> {
  const query: Record<string, string> = {};
  if (filters.status) query.status = filters.status;
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
