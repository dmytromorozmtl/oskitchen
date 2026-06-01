import type { VendorPlanTier, VendorStatus, VendorType } from "@prisma/client";

export type PlatformVendorAdminFilters = {
  tab: "all" | "queue";
  status?: VendorStatus;
  type?: VendorType;
  plan?: VendorPlanTier;
  q?: string;
  page: number;
  pageSize: number;
};

const STATUSES: VendorStatus[] = [
  "PENDING",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "SUSPENDED",
  "DEACTIVATED",
];

export function parsePlatformVendorAdminFilters(
  searchParams: Record<string, string | string[] | undefined>,
): PlatformVendorAdminFilters {
  const tabRaw = pickString(searchParams.tab);
  const tab: PlatformVendorAdminFilters["tab"] = tabRaw === "queue" ? "queue" : "all";

  const statusRaw = pickString(searchParams.status);
  const status = STATUSES.includes(statusRaw as VendorStatus)
    ? (statusRaw as VendorStatus)
    : undefined;

  const typeRaw = pickString(searchParams.type);
  const type = ["MANUFACTURER", "DISTRIBUTOR", "SERVICE_COMPANY", "COMBO"].includes(typeRaw ?? "")
    ? (typeRaw as VendorType)
    : undefined;

  const planRaw = pickString(searchParams.plan);
  const plan = ["FREE", "GROWTH", "ENTERPRISE"].includes(planRaw ?? "")
    ? (planRaw as VendorPlanTier)
    : undefined;

  const page = Math.max(1, Number(pickString(searchParams.page) ?? "1") || 1);

  return {
    tab,
    status: tab === "queue" ? status : status,
    type,
    plan,
    q: pickString(searchParams.q) || undefined,
    page,
    pageSize: 20,
  };
}

export function platformVendorAdminFiltersToQuery(
  filters: PlatformVendorAdminFilters,
): Record<string, string> {
  const query: Record<string, string> = {};
  if (filters.tab !== "all") query.tab = filters.tab;
  if (filters.status) query.status = filters.status;
  if (filters.type) query.type = filters.type;
  if (filters.plan) query.plan = filters.plan;
  if (filters.q) query.q = filters.q;
  if (filters.page > 1) query.page = String(filters.page);
  return query;
}

function pickString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}
