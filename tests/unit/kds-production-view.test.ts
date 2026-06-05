import { describe, expect, it } from "vitest";

import {
  buildProductionViewSnapshot,
  isActiveProductionStatus,
  KDS_DEFAULT_PREP_MINUTES_PER_ITEM,
  KDS_PRODUCTION_VIEW_ROUTE,
  normalizeProductionStation,
} from "@/lib/kitchen/kds-production-view";
import {
  KDS_PRODUCTION_VIEW_COMPONENT,
  KDS_PRODUCTION_VIEW_POLICY_ID,
  KDS_PRODUCTION_VIEW_ROUTE as POLICY_ROUTE,
} from "@/lib/kitchen/kds-production-view-policy";

const NOW = new Date("2026-06-05T12:00:00.000Z");

function item(overrides: Partial<Parameters<typeof buildProductionViewSnapshot>[0][number]> = {}) {
  return {
    id: overrides.id ?? "item-1",
    title: overrides.title ?? "Burger",
    station: overrides.station ?? "Grill",
    status: overrides.status ?? "TO_PREP",
    priority: overrides.priority ?? "NORMAL",
    quantity: overrides.quantity ?? 1,
    dueAtIso: overrides.dueAtIso ?? null,
    createdAtIso: overrides.createdAtIso ?? "2026-06-05T11:40:00.000Z",
    startedAtIso: overrides.startedAtIso ?? null,
  };
}

describe("KDS production view", () => {
  it("locks policy constants", () => {
    expect(KDS_PRODUCTION_VIEW_POLICY_ID).toBe("kds-production-view-v1");
    expect(KDS_PRODUCTION_VIEW_ROUTE).toBe("/dashboard/kitchen/production");
    expect(POLICY_ROUTE).toBe(KDS_PRODUCTION_VIEW_ROUTE);
    expect(KDS_PRODUCTION_VIEW_COMPONENT).toContain("production-view-client");
    expect(KDS_DEFAULT_PREP_MINUTES_PER_ITEM).toBe(4);
  });

  it("normalizes station labels", () => {
    expect(normalizeProductionStation(null)).toBe("Unassigned");
    expect(normalizeProductionStation("  Expo  ")).toBe("Expo");
  });

  it("flags active prep statuses", () => {
    expect(isActiveProductionStatus("TO_PREP")).toBe(true);
    expect(isActiveProductionStatus("DONE")).toBe(false);
  });

  it("detects bottleneck station and kitchen ETA", () => {
    const snapshot = buildProductionViewSnapshot(
      [
        item({ id: "a", station: "Grill", createdAtIso: "2026-06-05T10:00:00.000Z" }),
        item({ id: "b", station: "Grill", status: "IN_PROGRESS", startedAtIso: "2026-06-05T11:30:00.000Z" }),
        item({ id: "c", station: "Fry", createdAtIso: "2026-06-05T11:55:00.000Z" }),
        item({
          id: "d",
          station: "Grill",
          dueAtIso: "2026-06-05T11:30:00.000Z",
          createdAtIso: "2026-06-05T10:30:00.000Z",
        }),
      ],
      { now: NOW },
    );

    expect(snapshot.totalActive).toBe(4);
    expect(snapshot.bottleneckStation).toBe("Grill");
    expect(snapshot.stations[0]?.station).toBe("Grill");
    expect(snapshot.stations[0]?.isBottleneck).toBe(true);
    expect(snapshot.stations[0]?.overdueItems).toBeGreaterThanOrEqual(1);
    expect(snapshot.kitchenEtaMinutes).toBeGreaterThan(0);
  });

  it("returns empty snapshot when no active tickets", () => {
    const snapshot = buildProductionViewSnapshot(
      [item({ status: "DONE" })],
      { now: NOW },
    );
    expect(snapshot.totalActive).toBe(0);
    expect(snapshot.bottleneckStation).toBeNull();
    expect(snapshot.stations).toEqual([]);
  });
});
