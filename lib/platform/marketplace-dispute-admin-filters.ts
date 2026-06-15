import type { MarketplaceDisputeReason, MarketplaceDisputeStatus } from "@prisma/client";

export type PlatformDisputeAdminFilters = {
  status?: MarketplaceDisputeStatus;
  reason?: MarketplaceDisputeReason;
  dateFrom?: string;
  dateTo?: string;
  q?: string;
  page: number;
  pageSize: number;
};

const STATUSES: MarketplaceDisputeStatus[] = [
  "OPEN",
  "VENDOR_RESPONSE",
  "ADMIN_REVIEW",
  "RESOLVED",
];

const REASONS: MarketplaceDisputeReason[] = [
  "DAMAGED",
  "NOT_AS_DESCRIBED",
  "WRONG_ITEM",
  "DEFECTIVE",
  "NOT_DELIVERED",
  "OVERAGE",
];

export function parsePlatformDisputeAdminFilters(
  searchParams: Record<string, string | string[] | undefined>,
): PlatformDisputeAdminFilters {
  const statusRaw = pickString(searchParams.status);
  const status = STATUSES.includes(statusRaw as MarketplaceDisputeStatus)
    ? (statusRaw as MarketplaceDisputeStatus)
    : undefined;

  const reasonRaw = pickString(searchParams.reason);
  const reason = REASONS.includes(reasonRaw as MarketplaceDisputeReason)
    ? (reasonRaw as MarketplaceDisputeReason)
    : undefined;

  return {
    status,
    reason,
    dateFrom: pickString(searchParams.dateFrom) || undefined,
    dateTo: pickString(searchParams.dateTo) || undefined,
    q: pickString(searchParams.q) || undefined,
    page: Math.max(1, Number(pickString(searchParams.page) ?? "1") || 1),
    pageSize: 20,
  };
}

export function platformDisputeAdminFiltersToQuery(
  filters: PlatformDisputeAdminFilters,
): Record<string, string> {
  const query: Record<string, string> = {};
  if (filters.status) query.status = filters.status;
  if (filters.reason) query.reason = filters.reason;
  if (filters.dateFrom) query.dateFrom = filters.dateFrom;
  if (filters.dateTo) query.dateTo = filters.dateTo;
  if (filters.q) query.q = filters.q;
  if (filters.page > 1) query.page = String(filters.page);
  return query;
}

function pickString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}
