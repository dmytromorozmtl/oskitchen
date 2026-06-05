import { describe, expect, it } from "vitest";

import {
  applyKdsMultiStationRouting,
  assertKdsMultiStationRegistry,
  buildKdsMultiStationSnapshot,
  listDefaultKdsStations,
  resolveKdsFoodTypeFromCategory,
  routeKdsWorkItemToStation,
} from "@/lib/kitchen/kds-multi-station";
import {
  DEFAULT_KDS_STATIONS,
  KDS_MULTI_STATION_MIN_STATIONS,
  KDS_MULTI_STATION_POLICY_ID,
} from "@/lib/kitchen/kds-multi-station-policy";

const NOW = new Date("2026-06-05T12:00:00.000Z");

function workItem(
  overrides: Partial<Parameters<typeof routeKdsWorkItemToStation>[0]> = {},
) {
  return {
    id: overrides.id ?? "w1",
    title: overrides.title ?? "Cheeseburger",
    station: overrides.station ?? null,
    status: overrides.status ?? "TO_PREP",
    priority: overrides.priority ?? "NORMAL",
    quantity: overrides.quantity ?? 1,
    dueAtIso: overrides.dueAtIso ?? null,
    createdAtIso: overrides.createdAtIso ?? "2026-06-05T11:40:00.000Z",
    startedAtIso: overrides.startedAtIso ?? null,
    productCategory: overrides.productCategory ?? null,
  };
}

describe("KDS multi-station", () => {
  it("ships 12 default stations (10+ requirement)", () => {
    expect(DEFAULT_KDS_STATIONS.length).toBeGreaterThanOrEqual(KDS_MULTI_STATION_MIN_STATIONS);
    expect(listDefaultKdsStations().length).toBe(12);
    expect(assertKdsMultiStationRegistry(listDefaultKdsStations())).toBe(true);
  });

  it("routes by keyword before food type", () => {
    const routed = routeKdsWorkItemToStation(
      workItem({ title: "Truffle fries", productCategory: "MAINS" }),
      listDefaultKdsStations(),
    );
    expect(routed.routedStation).toBe("Fry");
    expect(routed.routingReason).toBe("keyword");
    expect(routed.foodType).toBe("fry");
  });

  it("routes by product category when no keyword match", () => {
    const routed = routeKdsWorkItemToStation(
      workItem({ title: "House special", productCategory: "DESSERTS" }),
      listDefaultKdsStations(),
    );
    expect(routed.routedStation).toBe("Dessert");
    expect(routed.routingReason).toBe("food_type");
    expect(resolveKdsFoodTypeFromCategory("DESSERTS")).toBe("dessert");
  });

  it("preserves explicitly assigned stations", () => {
    const routed = routeKdsWorkItemToStation(
      workItem({ station: "Pizza", title: "Burger" }),
      listDefaultKdsStations(),
    );
    expect(routed.routedStation).toBe("Pizza");
    expect(routed.routingReason).toBe("assigned");
  });

  it("builds snapshot with all registry stations visible", () => {
    const registry = listDefaultKdsStations();
    const snapshot = buildKdsMultiStationSnapshot(
      [
        workItem({ id: "a", title: "Ribeye", station: null }),
        workItem({ id: "b", title: "Caesar salad", station: null, productCategory: "SIDES" }),
        workItem({ id: "c", title: "Latte", station: null, productCategory: "BEVERAGES" }),
      ],
      registry,
      { now: NOW },
    );

    expect(snapshot.policyId).toBe(KDS_MULTI_STATION_POLICY_ID);
    expect(snapshot.stationCount).toBe(12);
    expect(snapshot.production.stations.length).toBe(12);
    expect(snapshot.routedItems).toHaveLength(3);
    expect(snapshot.production.totalActive).toBe(3);
    expect(applyKdsMultiStationRouting(snapshot.routedItems, registry)).toHaveLength(3);
  });
});
