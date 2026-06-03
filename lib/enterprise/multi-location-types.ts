import type { AnalyticsFilters } from "@/lib/analytics/filters";
import type {
  ComparisonVsAverage,
  LocationAnalyticsRow,
  MultiLocationAnalyticsSnapshot,
} from "@/services/analytics/multi-location-analytics";

export type EnterpriseLocationAlertSeverity = "warning" | "info";

export type EnterpriseLocationAlert = {
  id: string;
  locationId: string;
  locationName: string;
  severity: EnterpriseLocationAlertSeverity;
  message: string;
};

export type EnterpriseLocationRank = {
  rank: number;
  locationId: string;
  locationName: string;
  revenue: number;
  orders: number;
  laborPct: number | null;
  foodCostPct: number | null;
  revenueShare: number | null;
  vsAvgRevenue: ComparisonVsAverage | null;
  vsAvgLaborPct: ComparisonVsAverage | null;
  vsAvgFoodCostPct: ComparisonVsAverage | null;
};

export type EnterpriseMultiLocationDashboard = {
  snapshot: MultiLocationAnalyticsSnapshot;
  filters: AnalyticsFilters;
  ranks: EnterpriseLocationRank[];
  selectedLocation: LocationAnalyticsRow | null;
  alerts: EnterpriseLocationAlert[];
  basePath: string;
};
