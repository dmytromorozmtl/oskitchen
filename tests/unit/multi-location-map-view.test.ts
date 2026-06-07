import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditMultiLocationMapViewWiring } from "@/lib/enterprise/multi-location-map-view-audit";
import {
  buildMultiLocationMapPins,
  findMultiLocationMapPin,
  multiLocationMapSwitcherOptions,
} from "@/lib/enterprise/multi-location-map-view-data";
import {
  MULTI_LOCATION_MAP_VIEW_CI_SCRIPTS,
  MULTI_LOCATION_MAP_VIEW_POLICY_ID,
  MULTI_LOCATION_MAP_VIEW_ROUTE,
  MULTI_LOCATION_MAP_VIEW_TEST_ID,
  MULTI_LOCATION_MAP_VIEW_UNIT_TEST,
  multiLocationFloorPlanHref,
  multiLocationMapViewHref,
} from "@/lib/enterprise/multi-location-map-view-policy";

const ROOT = process.cwd();

describe("multi-location map view (Absolute Final Task 60)", () => {
  it("locks map view route and floor plan deep links", () => {
    expect(MULTI_LOCATION_MAP_VIEW_POLICY_ID).toBe("multi-location-map-view-absolute-final-v1");
    expect(MULTI_LOCATION_MAP_VIEW_ROUTE).toBe("/dashboard/enterprise/multi-location");
    expect(MULTI_LOCATION_MAP_VIEW_TEST_ID).toBe("multi-location-map-view");
    expect(multiLocationFloorPlanHref("loc-1")).toBe("/dashboard/floor-plans?locationId=loc-1");
    expect(multiLocationMapViewHref("loc-2")).toContain("locationId=loc-2");
  });

  it("builds deterministic map pins with floor plan and location hrefs", () => {
    const pins = buildMultiLocationMapPins([
      {
        locationId: "a",
        locationName: "Downtown",
        status: "ACTIVE",
        type: "RESTAURANT",
        orders: 120,
        revenue: 5400,
        avgOrderValue: 45,
        pickupOrders: 80,
        deliveryOrders: 40,
        routes: 2,
        tasks: 0,
        revenueShare: 60,
        laborCost: 900,
        laborPct: 16.7,
        foodCostPct: 28,
        vsAvgRevenue: "above",
        vsAvgOrders: "above",
        vsAvgLaborPct: null,
        vsAvgFoodCostPct: null,
      },
      {
        locationId: "b",
        locationName: "Airport",
        status: "SETUP",
        type: "RESTAURANT",
        orders: 40,
        revenue: 1800,
        avgOrderValue: 45,
        pickupOrders: 40,
        deliveryOrders: 0,
        routes: 1,
        tasks: 0,
        revenueShare: 40,
        laborCost: 400,
        laborPct: 22,
        foodCostPct: 30,
        vsAvgRevenue: "below",
        vsAvgOrders: "below",
        vsAvgLaborPct: null,
        vsAvgFoodCostPct: null,
      },
    ]);

    expect(pins).toHaveLength(2);
    expect(pins[0]?.locationId).toBe("a");
    expect(pins[0]?.floorPlanHref).toContain("locationId=a");
    expect(pins[0]?.locationHref).toBe("/dashboard/locations/a");
    expect(findMultiLocationMapPin(pins, "b")?.name).toBe("Airport");
    expect(multiLocationMapSwitcherOptions(pins)).toHaveLength(2);
  });

  it("audits enterprise panel, map view, and floor plan wiring", () => {
    const audit = auditMultiLocationMapViewWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);

    expect(existsSync(join(ROOT, "components/enterprise/multi-location-map-view.tsx"))).toBe(true);
    const panel = readFileSync(
      join(ROOT, "components/enterprise/multi-location-enterprise-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("MultiLocationMapView");
  });

  it("ships npm cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of MULTI_LOCATION_MAP_VIEW_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(MULTI_LOCATION_MAP_VIEW_UNIT_TEST).toBe("tests/unit/multi-location-map-view.test.ts");
  });
});
