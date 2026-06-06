import type { MULTI_LOCATION_DASHBOARD_2_POLICY_ID } from "@/lib/enterprise/multi-location-dashboard-2-policy";
import type { EnterpriseLocationRank } from "@/lib/enterprise/multi-location-types";

export type { EnterpriseLocationRank };

export type MultiLocationScaleTier = "standard" | "enterprise";

export type LocationComparisonPair = {
  locationA: EnterpriseLocationRank;
  locationB: EnterpriseLocationRank;
  revenueDelta: number;
  revenueDeltaPct: number | null;
  ordersDelta: number;
  laborPctDelta: number | null;
  foodCostPctDelta: number | null;
};

export type EnterpriseMultiLocationDashboardV2 = {
  policyId: typeof MULTI_LOCATION_DASHBOARD_2_POLICY_ID;
  scaleTier: MultiLocationScaleTier;
  locationCapacity: number;
  enterpriseScaleThreshold: number;
  rankPage: number;
  rankPageSize: number;
  rankPageCount: number;
  rankSearchQuery: string;
  paginatedRanks: EnterpriseLocationRank[];
  filteredRankCount: number;
  tablePage: number;
  tablePageSize: number;
  tablePageCount: number;
  paginatedTableRanks: EnterpriseLocationRank[];
  comparisonPair: LocationComparisonPair | null;
  supportsHundredPlus: boolean;
};
