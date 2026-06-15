import { describe, expect, it } from "vitest";

import { buildMultiLocationAnalyticsSnapshot, applyMultiLocationComparisonMetrics } from "@/services/analytics/multi-location-analytics";

describe("multi-location analytics", () => {
  const from = new Date("2026-05-01T00:00:00.000Z");
  const to = new Date("2026-05-31T23:59:59.999Z");

  it("aggregates revenue and fulfillment mix per location", () => {
    const snapshot = buildMultiLocationAnalyticsSnapshot({
      from,
      to,
      locations: [
        { id: "loc-a", name: "Downtown", status: "ACTIVE", type: "RESTAURANT" },
        { id: "loc-b", name: "Airport", status: "ACTIVE", type: "RESTAURANT" },
      ],
      orders: [
        {
          locationId: "loc-a",
          status: "COMPLETED",
          total: 40,
          fulfillmentType: "PICKUP",
          createdAt: new Date("2026-05-10T12:00:00.000Z"),
        },
        {
          locationId: "loc-b",
          status: "COMPLETED",
          total: 60,
          fulfillmentType: "DELIVERY",
          createdAt: new Date("2026-05-11T12:00:00.000Z"),
        },
        {
          locationId: null,
          status: "COMPLETED",
          total: 10,
          fulfillmentType: "DELIVERY",
          createdAt: new Date("2026-05-12T12:00:00.000Z"),
        },
      ],
      routesByLocation: new Map([
        ["loc-a", 2],
        ["loc-b", 5],
      ]),
      tasksByLocation: new Map([
        ["loc-a", 3],
        ["loc-b", 1],
      ]),
    });

    expect(snapshot.totalOrders).toBe(3);
    expect(snapshot.totalRevenue).toBe(110);
    expect(snapshot.topLocation?.locationId).toBe("loc-b");
    expect(snapshot.locations[0]).toMatchObject({
      locationId: "loc-a",
      orders: 1,
      revenue: 40,
      pickupOrders: 1,
      routes: 2,
      tasks: 3,
    });
    expect(snapshot.unassignedOrders).toBe(1);
    expect(snapshot.dailyTrend).toHaveLength(3);
    expect(snapshot.networkAverages.orders).toBeGreaterThan(0);
    expect(snapshot.locations[0]?.laborPct).toBeNull();
  });

  it("applies comparison metrics vs network average", () => {
    const base = buildMultiLocationAnalyticsSnapshot({
      from,
      to,
      locations: [
        { id: "loc-a", name: "Downtown", status: "ACTIVE", type: "RESTAURANT" },
        { id: "loc-b", name: "Airport", status: "ACTIVE", type: "RESTAURANT" },
      ],
      orders: [
        {
          locationId: "loc-a",
          status: "COMPLETED",
          total: 100,
          fulfillmentType: "PICKUP",
          createdAt: new Date("2026-05-10T12:00:00.000Z"),
        },
        {
          locationId: "loc-b",
          status: "COMPLETED",
          total: 50,
          fulfillmentType: "DELIVERY",
          createdAt: new Date("2026-05-11T12:00:00.000Z"),
        },
      ],
      routesByLocation: new Map(),
      tasksByLocation: new Map(),
      laborCostByLocation: new Map([
        ["loc-a", 30],
        ["loc-b", 20],
      ]),
      foodCostPctByLocation: new Map([
        ["loc-a", 28],
        ["loc-b", 35],
      ]),
    });

    const downtown = base.locations.find((row) => row.locationId === "loc-a");
    expect(downtown?.vsAvgRevenue).toBe("above");
    expect(downtown?.laborPct).toBe(30);
    expect(downtown?.foodCostPct).toBe(28);

    const { networkAverages } = applyMultiLocationComparisonMetrics(base.locations);
    expect(networkAverages.revenue).toBe(75);
  });
});
