import { describe, expect, it } from "vitest";

import {
  buildMultiLocationRollup,
  buildMultiLocationRollupCsv,
  buildMultiLocationRollupExportHref,
} from "@/lib/enterprise/multi-location-rollup-builders";
import { buildMultiLocationAnalyticsSnapshot } from "@/services/analytics/multi-location-analytics";

describe("multi-location rollup", () => {
  const from = new Date("2026-05-01T00:00:00.000Z");
  const to = new Date("2026-05-31T23:59:59.999Z");

  it("builds network + location + unassigned rollup rows", () => {
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
          total: 100,
          fulfillmentType: "PICKUP",
          createdAt: new Date("2026-05-10T12:00:00.000Z"),
        },
        {
          locationId: "loc-b",
          status: "COMPLETED",
          total: 200,
          fulfillmentType: "DELIVERY",
          createdAt: new Date("2026-05-11T12:00:00.000Z"),
        },
        {
          locationId: null,
          status: "COMPLETED",
          total: 50,
          fulfillmentType: "DELIVERY",
          createdAt: new Date("2026-05-12T12:00:00.000Z"),
        },
      ],
      routesByLocation: new Map(),
      tasksByLocation: new Map(),
    });

    const rollup = buildMultiLocationRollup({ snapshot });
    expect(rollup.networkOrders).toBe(3);
    expect(rollup.networkRevenue).toBe(350);
    expect(rollup.rows[0]?.kind).toBe("network");
    expect(rollup.rows.filter((r) => r.kind === "location")).toHaveLength(2);
    expect(rollup.rows.some((r) => r.kind === "unassigned")).toBe(true);
    expect(rollup.rows.find((r) => r.locationId === "loc-b")?.drilldownHref).toContain("loc-b");
  });

  it("exports rollup CSV with header row", () => {
    const snapshot = buildMultiLocationAnalyticsSnapshot({
      from,
      to,
      locations: [{ id: "loc-a", name: "Downtown", status: "ACTIVE", type: "RESTAURANT" }],
      orders: [
        {
          locationId: "loc-a",
          status: "COMPLETED",
          total: 80,
          fulfillmentType: "PICKUP",
          createdAt: new Date("2026-05-10T12:00:00.000Z"),
        },
      ],
      routesByLocation: new Map(),
      tasksByLocation: new Map(),
    });
    const csv = buildMultiLocationRollupCsv(buildMultiLocationRollup({ snapshot }));
    expect(csv.split("\n")[0]).toContain("kind,label,locationId");
    expect(csv).toContain("Downtown");
    expect(csv).toContain("Network total");
  });

  it("builds rollup export href with date filters", () => {
    const href = buildMultiLocationRollupExportHref({
      from: new Date("2026-06-01T00:00:00.000Z"),
      to: new Date("2026-06-07T00:00:00.000Z"),
    });
    expect(href).toContain("/api/dashboard/multi-location/rollup-export?");
    expect(href).toContain("from=");
    expect(href).toContain("to=");
  });
});
