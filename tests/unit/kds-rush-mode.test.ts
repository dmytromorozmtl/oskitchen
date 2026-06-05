import { describe, expect, it } from "vitest";

import {
  buildKdsRushModeSnapshot,
  countKdsArrivalsInWindow,
  detectKdsRushLevel,
  detectKdsRushPeakSignals,
  formatKdsRushLevelLabel,
  shouldShowKdsRushMode,
} from "@/lib/kitchen/kds-rush-mode";
import {
  KDS_RUSH_MODE_COMPONENT,
  KDS_RUSH_MODE_POLICY_ID,
} from "@/lib/kitchen/kds-rush-mode-policy";

const NOW = new Date("2026-06-05T12:00:00.000Z").getTime();

function ticket(
  id: string,
  status: string,
  elapsedSeconds: number,
  createdAt: string,
  extras?: { hasAllergenConflict?: boolean; customerName?: string },
) {
  return {
    id,
    status,
    elapsedSeconds,
    createdAt,
    customerName: extras?.customerName ?? "Guest",
    hasAllergenConflict: extras?.hasAllergenConflict,
  };
}

describe("KDS rush mode", () => {
  it("locks policy constants", () => {
    expect(KDS_RUSH_MODE_POLICY_ID).toBe("kds-rush-mode-v1");
    expect(KDS_RUSH_MODE_COMPONENT).toBe("components/kitchen/rush-mode.tsx");
  });

  it("counts arrivals in rolling window", () => {
    const orders = [
      { createdAt: "2026-06-05T11:55:00.000Z" },
      { createdAt: "2026-06-05T11:52:00.000Z" },
      { createdAt: "2026-06-05T10:30:00.000Z" },
    ];
    expect(countKdsArrivalsInWindow(orders, 10 * 60 * 1000, NOW)).toBe(2);
  });

  it("detects building and peak rush levels", () => {
    expect(
      detectKdsRushLevel(
        { total: 4, preparing: 3, ready: 1, overdue: 0, oldestPrepSeconds: 120 },
        2,
      ),
    ).toBe("normal");

    expect(
      detectKdsRushLevel(
        { total: 6, preparing: 4, ready: 2, overdue: 2, oldestPrepSeconds: 400 },
        3,
      ),
    ).toBe("building");

    expect(
      detectKdsRushLevel(
        { total: 9, preparing: 6, ready: 3, overdue: 1, oldestPrepSeconds: 500 },
        4,
      ),
    ).toBe("rush");

    expect(
      detectKdsRushLevel(
        { total: 3, preparing: 2, ready: 1, overdue: 3, oldestPrepSeconds: 960 },
        1,
      ),
    ).toBe("rush");
  });

  it("builds rush snapshot with priority routes and peak signals", () => {
    const orders = Array.from({ length: 8 }, (_, index) =>
      ticket(
        `o${index}`,
        index < 6 ? "PREPARING" : "READY",
        120 + index * 30,
        new Date(NOW - index * 60_000).toISOString(),
        index === 0 ? { hasAllergenConflict: true, customerName: "Alex" } : undefined,
      ),
    );

    const snapshot = buildKdsRushModeSnapshot(orders, { nowMs: NOW });

    expect(snapshot.level).toBe("rush");
    expect(snapshot.peakSignals).toContain("active_volume");
    expect(snapshot.priorityRoutes.length).toBeGreaterThan(0);
    expect(snapshot.priorityRoutes[0]?.reasons).toContain("allergen");
    expect(snapshot.policyId).toBe(KDS_RUSH_MODE_POLICY_ID);
    expect(shouldShowKdsRushMode(snapshot)).toBe(true);
    expect(formatKdsRushLevelLabel(snapshot.level)).toBe("Peak rush");
  });

  it("routes oldest tickets during rush when no allergen/overdue candidates", () => {
    const orders = Array.from({ length: 8 }, (_, index) =>
      ticket(
        `r${index}`,
        "PREPARING",
        60 + index * 10,
        new Date(NOW - index * 45_000).toISOString(),
      ),
    );

    const snapshot = buildKdsRushModeSnapshot(orders, { nowMs: NOW });
    expect(snapshot.level).toBe("rush");
    expect(snapshot.priorityRoutes.length).toBeGreaterThan(0);
    expect(snapshot.priorityRoutes[0]?.order.id).toBe("r7");
  });

  it("detects peak signals for arrival surge and overdue spike", () => {
    expect(
      detectKdsRushPeakSignals(
        { total: 5, preparing: 4, ready: 1, overdue: 2, oldestPrepSeconds: 900 },
        5,
      ),
    ).toEqual(["active_volume", "arrival_rate", "overdue_spike"]);
  });
});
