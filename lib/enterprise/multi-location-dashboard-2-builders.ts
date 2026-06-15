import {
  MULTI_LOCATION_COMPARISON_TABLE_PAGE_SIZE,
  MULTI_LOCATION_DASHBOARD_2_POLICY_ID,
  MULTI_LOCATION_DASHBOARD_MAX_LOCATIONS,
  MULTI_LOCATION_ENTERPRISE_SCALE_THRESHOLD,
  MULTI_LOCATION_MAX_ALERTS,
  MULTI_LOCATION_RANK_PAGE_SIZE,
} from "@/lib/enterprise/multi-location-dashboard-2-policy";
import type {
  EnterpriseLocationRank,
  EnterpriseMultiLocationDashboardV2,
  LocationComparisonPair,
  MultiLocationScaleTier,
} from "@/lib/enterprise/multi-location-dashboard-2-types";

export type MultiLocationDashboard2ViewState = {
  page?: number;
  searchQuery?: string;
  compareA?: string | null;
  compareB?: string | null;
  tablePage?: number;
};

export function resolveMultiLocationScaleTier(locationCount: number): MultiLocationScaleTier {
  return locationCount >= MULTI_LOCATION_ENTERPRISE_SCALE_THRESHOLD ? "enterprise" : "standard";
}

export function filterEnterpriseLocationRanks(
  ranks: EnterpriseLocationRank[],
  searchQuery = "",
): EnterpriseLocationRank[] {
  const q = searchQuery.trim().toLowerCase();
  if (!q) return ranks;
  return ranks.filter(
    (row) =>
      row.locationName.toLowerCase().includes(q) || row.locationId.toLowerCase().includes(q),
  );
}

export function paginateItems<T>(items: T[], page: number, pageSize: number): {
  items: T[];
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
} {
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    pageCount,
    total,
  };
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function pctDelta(a: number, b: number): number | null {
  if (b === 0) return a === 0 ? 0 : null;
  return round1(((a - b) / b) * 100);
}

export function buildLocationComparisonPair(
  ranks: EnterpriseLocationRank[],
  compareA?: string | null,
  compareB?: string | null,
): LocationComparisonPair | null {
  if (!compareA || !compareB || compareA === compareB) return null;
  const locationA = ranks.find((r) => r.locationId === compareA);
  const locationB = ranks.find((r) => r.locationId === compareB);
  if (!locationA || !locationB) return null;

  return {
    locationA,
    locationB,
    revenueDelta: round1(locationA.revenue - locationB.revenue),
    revenueDeltaPct: pctDelta(locationA.revenue, locationB.revenue),
    ordersDelta: locationA.orders - locationB.orders,
    laborPctDelta:
      locationA.laborPct != null && locationB.laborPct != null
        ? round1(locationA.laborPct - locationB.laborPct)
        : null,
    foodCostPctDelta:
      locationA.foodCostPct != null && locationB.foodCostPct != null
        ? round1(locationA.foodCostPct - locationB.foodCostPct)
        : null,
  };
}

export function buildEnterpriseMultiLocationDashboardV2(input: {
  ranks: EnterpriseLocationRank[];
  totalLocations: number;
  viewState?: MultiLocationDashboard2ViewState;
}): EnterpriseMultiLocationDashboardV2 {
  const viewState = input.viewState ?? {};
  const searchQuery = viewState.searchQuery?.trim() ?? "";
  const filteredRanks = filterEnterpriseLocationRanks(input.ranks, searchQuery);
  const rankPagination = paginateItems(
    filteredRanks,
    viewState.page ?? 1,
    MULTI_LOCATION_RANK_PAGE_SIZE,
  );
  const tablePagination = paginateItems(
    filteredRanks,
    viewState.tablePage ?? 1,
    MULTI_LOCATION_COMPARISON_TABLE_PAGE_SIZE,
  );

  return {
    policyId: MULTI_LOCATION_DASHBOARD_2_POLICY_ID,
    scaleTier: resolveMultiLocationScaleTier(input.totalLocations),
    locationCapacity: MULTI_LOCATION_DASHBOARD_MAX_LOCATIONS,
    enterpriseScaleThreshold: MULTI_LOCATION_ENTERPRISE_SCALE_THRESHOLD,
    rankPage: rankPagination.page,
    rankPageSize: rankPagination.pageSize,
    rankPageCount: rankPagination.pageCount,
    rankSearchQuery: searchQuery,
    paginatedRanks: rankPagination.items,
    filteredRankCount: rankPagination.total,
    tablePage: tablePagination.page,
    tablePageSize: tablePagination.pageSize,
    tablePageCount: tablePagination.pageCount,
    paginatedTableRanks: tablePagination.items,
    comparisonPair: buildLocationComparisonPair(
      input.ranks,
      viewState.compareA,
      viewState.compareB,
    ),
    supportsHundredPlus: input.totalLocations <= MULTI_LOCATION_DASHBOARD_MAX_LOCATIONS,
  };
}

export function capEnterpriseLocationAlerts<T>(alerts: T[]): T[] {
  return alerts.slice(0, MULTI_LOCATION_MAX_ALERTS);
}
