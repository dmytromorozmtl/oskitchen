import { describe, expect, it } from "vitest";

import {
  buildEnterpriseLocationAlerts,
  buildEnterpriseLocationRanks,
  buildEnterpriseMultiLocationDashboard,
} from "@/lib/enterprise/multi-location-builders";
import { buildMultiLocationRollup } from "@/lib/enterprise/multi-location-rollup-builders";
import type { LocationAnalyticsRow } from "@/services/analytics/multi-location-analytics";

function row(partial: Partial<LocationAnalyticsRow> & Pick<LocationAnalyticsRow, "locationId" | "locationName">): LocationAnalyticsRow {
  return {
    status: "ACTIVE",
    type: "RESTAURANT",
    orders: 10,
    revenue: 1000,
    avgOrderValue: 100,
    pickupOrders: 5,
    deliveryOrders: 5,
    routes: 1,
    tasks: 2,
    revenueShare: 20,
    laborCost: 200,
    laborPct: 25,
    foodCostPct: 30,
    vsAvgRevenue: null,
    vsAvgOrders: null,
    vsAvgLaborPct: null,
    vsAvgFoodCostPct: null,
    ...partial,
  };
}

describe("multi-location enterprise builders", () => {
  it("ranks locations by revenue descending", () => {
    const ranks = buildEnterpriseLocationRanks([
      row({ locationId: "a", locationName: "A", revenue: 500 }),
      row({ locationId: "b", locationName: "B", revenue: 2000 }),
    ]);
    expect(ranks[0]?.locationId).toBe("b");
    expect(ranks[0]?.rank).toBe(1);
  });

  it("creates alerts for underperforming and top locations", () => {
    const alerts = buildEnterpriseLocationAlerts([
      row({
        locationId: "low",
        locationName: "Low",
        vsAvgRevenue: "below",
        orders: 5,
      }),
      row({
        locationId: "star",
        locationName: "Star",
        vsAvgRevenue: "above",
        revenueShare: 40,
      }),
    ]);
    expect(alerts.some((a) => a.locationId === "low")).toBe(true);
    expect(alerts.some((a) => a.locationId === "star")).toBe(true);
  });

  it("selects drill-down location when id provided", () => {
    const locations = [
      row({ locationId: "x", locationName: "X" }),
      row({ locationId: "y", locationName: "Y" }),
    ];
    const snapshot = {
        rangeLabel: "test",
        totalLocations: 2,
        activeLocations: 2,
        totalOrders: 20,
        totalRevenue: 2000,
        unassignedOrders: 0,
        unassignedRevenue: 0,
        locations,
        topLocation: locations[1] ?? null,
        dailyTrend: [],
        networkAverages: { revenue: 1000, orders: 10, laborPct: 25, foodCostPct: 30 },
      };
    const dashboard = buildEnterpriseMultiLocationDashboard({
      snapshot,
      rollup: buildMultiLocationRollup({ snapshot }),
      filters: {
        from: new Date(),
        to: new Date(),
        preset: "30d",
      },
      selectedLocationId: "y",
    });
    expect(dashboard.selectedLocation?.locationName).toBe("Y");
  });
});
