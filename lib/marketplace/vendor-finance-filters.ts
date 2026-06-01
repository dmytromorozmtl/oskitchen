import type { MarketplaceTransactionStatus } from "@prisma/client";

export type VendorFinanceFilters = {
  status?: MarketplaceTransactionStatus;
  dateFrom?: string;
  dateTo?: string;
  q?: string;
  page: number;
  pageSize: number;
};

const STATUSES: MarketplaceTransactionStatus[] = ["PENDING", "AVAILABLE", "PAID_OUT"];

export function parseVendorFinanceFilters(
  searchParams: Record<string, string | string[] | undefined>,
): VendorFinanceFilters {
  const statusRaw = pickString(searchParams.status);
  const status = STATUSES.includes(statusRaw as MarketplaceTransactionStatus)
    ? (statusRaw as MarketplaceTransactionStatus)
    : undefined;

  const page = Math.max(1, Number(pickString(searchParams.page) ?? "1") || 1);

  return {
    status,
    dateFrom: pickString(searchParams.from) || undefined,
    dateTo: pickString(searchParams.to) || undefined,
    q: pickString(searchParams.q) || undefined,
    page,
    pageSize: 20,
  };
}

export function vendorFinanceFiltersToQuery(filters: VendorFinanceFilters): Record<string, string> {
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
