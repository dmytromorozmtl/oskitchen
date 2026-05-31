import { describe, expect, it } from "vitest";

import {
  buildMultiLocationPdfRows,
  formatMultiLocationWeeklyReportEmail,
} from "@/services/analytics/multi-location-report-service";
import type { MultiLocationAnalyticsSnapshot } from "@/services/analytics/multi-location-analytics";

const snapshot: MultiLocationAnalyticsSnapshot = {
  rangeLabel: "2026-05-01 → 2026-05-31",
  totalLocations: 2,
  activeLocations: 2,
  totalOrders: 30,
  totalRevenue: 3000,
  unassignedOrders: 0,
  unassignedRevenue: 0,
  topLocation: null,
  dailyTrend: [],
  networkAverages: { revenue: 1500, orders: 15, laborPct: 28, foodCostPct: 32 },
  locations: [
    {
      locationId: "loc-a",
      locationName: "Downtown",
      status: "ACTIVE",
      type: "RESTAURANT",
      orders: 20,
      revenue: 2000,
      avgOrderValue: 100,
      pickupOrders: 10,
      deliveryOrders: 10,
      routes: 2,
      tasks: 3,
      revenueShare: 66.7,
      laborCost: 500,
      laborPct: 25,
      foodCostPct: 30,
      vsAvgRevenue: "above",
      vsAvgOrders: "above",
      vsAvgLaborPct: "below",
      vsAvgFoodCostPct: "below",
    },
  ],
};

describe("multi-location report service", () => {
  it("builds PDF rows for export", () => {
    const pdf = buildMultiLocationPdfRows(snapshot);
    expect(pdf.head).toContain("Labor %");
    expect(pdf.body[0]?.[0]).toBe("Downtown");
  });

  it("formats weekly email digest", () => {
    const email = formatMultiLocationWeeklyReportEmail({
      snapshot,
      dashboardUrl: "https://example.com/dashboard/locations/dashboard",
    });
    expect(email.subject).toContain("Weekly multi-location report");
    expect(email.text).toContain("Downtown");
    expect(email.text).toContain("Network averages");
  });
});
