import type {
  EnterpriseLocationAlert,
  EnterpriseLocationRank,
  EnterpriseMultiLocationDashboard,
} from "@/lib/enterprise/multi-location-types";
import type { AnalyticsFilters } from "@/lib/analytics/filters";
import type {
  LocationAnalyticsRow,
  MultiLocationAnalyticsSnapshot,
} from "@/services/analytics/multi-location-analytics";

export function buildEnterpriseLocationRanks(
  locations: LocationAnalyticsRow[],
): EnterpriseLocationRank[] {
  const sorted = [...locations].sort((a, b) => b.revenue - a.revenue || b.orders - a.orders);
  return sorted.map((row, index) => ({
    rank: index + 1,
    locationId: row.locationId,
    locationName: row.locationName,
    revenue: row.revenue,
    orders: row.orders,
    laborPct: row.laborPct,
    foodCostPct: row.foodCostPct,
    revenueShare: row.revenueShare,
    vsAvgRevenue: row.vsAvgRevenue,
    vsAvgLaborPct: row.vsAvgLaborPct,
    vsAvgFoodCostPct: row.vsAvgFoodCostPct,
  }));
}

export function buildEnterpriseLocationAlerts(locations: LocationAnalyticsRow[]): EnterpriseLocationAlert[] {
  const alerts: EnterpriseLocationAlert[] = [];

  for (const row of locations) {
    if (row.vsAvgRevenue === "below" && row.orders > 0) {
      alerts.push({
        id: `rev-${row.locationId}`,
        locationId: row.locationId,
        locationName: row.locationName,
        severity: "warning",
        message: `Revenue below network average (${row.orders} orders in range).`,
      });
    }
    if (row.vsAvgLaborPct === "above" && row.laborPct != null) {
      alerts.push({
        id: `labor-${row.locationId}`,
        locationId: row.locationId,
        locationName: row.locationName,
        severity: "warning",
        message: `Labor at ${row.laborPct}% — above network average.`,
      });
    }
    if (row.vsAvgFoodCostPct === "above" && row.foodCostPct != null) {
      alerts.push({
        id: `food-${row.locationId}`,
        locationId: row.locationId,
        locationName: row.locationName,
        severity: "warning",
        message: `Food cost at ${row.foodCostPct}% — above network average.`,
      });
    }
    if (row.vsAvgRevenue === "above" && row.revenueShare != null && row.revenueShare >= 35) {
      alerts.push({
        id: `star-${row.locationId}`,
        locationId: row.locationId,
        locationName: row.locationName,
        severity: "info",
        message: `Top performer — ${row.revenueShare}% of network revenue.`,
      });
    }
  }

  return alerts.slice(0, 8);
}

export function buildEnterpriseMultiLocationDashboard(input: {
  snapshot: MultiLocationAnalyticsSnapshot;
  filters: AnalyticsFilters;
  selectedLocationId?: string | null;
  basePath?: string;
}): EnterpriseMultiLocationDashboard {
  const ranks = buildEnterpriseLocationRanks(input.snapshot.locations);
  const selectedLocation =
    input.selectedLocationId != null
      ? input.snapshot.locations.find((l) => l.locationId === input.selectedLocationId) ?? null
      : null;

  return {
    snapshot: input.snapshot,
    filters: input.filters,
    ranks,
    selectedLocation,
    alerts: buildEnterpriseLocationAlerts(input.snapshot.locations),
    basePath: input.basePath ?? "/dashboard/enterprise/multi-location",
  };
}
