import type { MultiLocationAnalyticsSnapshot } from "@/services/analytics/multi-location-analytics";

export type MultiLocationRollupRowKind = "location" | "network" | "unassigned";

export type MultiLocationRollupRow = {
  kind: MultiLocationRollupRowKind;
  locationId: string | null;
  label: string;
  orders: number;
  revenue: number;
  revenueSharePct: number | null;
  laborPct: number | null;
  foodCostPct: number | null;
  avgOrderValue: number | null;
  vsAvgRevenue: string | null;
  vsAvgLaborPct: string | null;
  drilldownHref: string | null;
};

export type MultiLocationRollup = {
  rangeLabel: string;
  generatedAt: string;
  totalLocations: number;
  activeLocations: number;
  networkOrders: number;
  networkRevenue: number;
  unassignedOrders: number;
  unassignedRevenue: number;
  networkLaborPct: number | null;
  networkFoodCostPct: number | null;
  rows: MultiLocationRollupRow[];
};

export type BuildMultiLocationRollupInput = {
  snapshot: MultiLocationAnalyticsSnapshot;
  basePath?: string;
  generatedAt?: Date;
};
