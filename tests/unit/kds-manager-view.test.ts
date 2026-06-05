import { describe, expect, it } from "vitest";

import { buildExpoViewSnapshot } from "@/lib/kitchen/kds-expo-view";
import {
  buildKdsManagerViewSnapshot,
  KDS_MANAGER_VIEW_ROUTE,
  normalizeManagerStation,
} from "@/lib/kitchen/kds-manager-view";
import {
  KDS_MANAGER_VIEW_COMPONENT,
  KDS_MANAGER_VIEW_POLICY_ID,
  KDS_MANAGER_VIEW_ROUTE as POLICY_ROUTE,
} from "@/lib/kitchen/kds-manager-view-policy";
import { buildProductionViewSnapshot } from "@/lib/kitchen/kds-production-view";

describe("KDS manager view", () => {
  it("locks policy constants", () => {
    expect(KDS_MANAGER_VIEW_POLICY_ID).toBe("kds-manager-view-v1");
    expect(KDS_MANAGER_VIEW_ROUTE).toBe("/dashboard/kitchen/manager");
    expect(POLICY_ROUTE).toBe(KDS_MANAGER_VIEW_ROUTE);
    expect(KDS_MANAGER_VIEW_COMPONENT).toContain("manager-view-client");
  });

  it("normalizes station labels", () => {
    expect(normalizeManagerStation(null)).toBe("Unassigned");
  });

  it("builds performance, delay, and efficiency snapshot", () => {
    const production = buildProductionViewSnapshot(
      [
        {
          id: "w1",
          title: "Burger",
          station: "Grill",
          status: "IN_PROGRESS",
          priority: "NORMAL",
          quantity: 1,
          dueAtIso: null,
          createdAtIso: "2026-06-05T11:30:00.000Z",
          startedAtIso: "2026-06-05T11:35:00.000Z",
        },
        {
          id: "w2",
          title: "Fries",
          station: "Grill",
          status: "TO_PREP",
          priority: "NORMAL",
          quantity: 1,
          dueAtIso: "2026-06-05T11:00:00.000Z",
          createdAtIso: "2026-06-05T10:30:00.000Z",
          startedAtIso: null,
        },
      ],
      { now: new Date("2026-06-05T12:00:00.000Z") },
    );

    const expo = buildExpoViewSnapshot(
      [
        {
          id: "o1",
          kind: "order",
          title: "Alex",
          subtitle: null,
          status: "READY",
          elapsedSeconds: 200,
          dueAtIso: null,
          tableName: "4",
          itemSummary: "Burger",
          priority: "normal",
        },
        {
          id: "o2",
          kind: "order",
          title: "Sam",
          subtitle: null,
          status: "PREPARING",
          elapsedSeconds: 1200,
          dueAtIso: null,
          tableName: null,
          itemSummary: "Salad",
          priority: "high",
        },
      ],
      { now: new Date("2026-06-05T12:00:00.000Z") },
    );

    const snapshot = buildKdsManagerViewSnapshot({
      production,
      expo,
      queueSummary: {
        total: 2,
        preparing: 1,
        ready: 1,
        overdue: 1,
        oldestPrepSeconds: 1200,
      },
      completedToday: [
        { station: "Grill", prepMinutes: 12, wasOnTime: true },
        { station: "Grill", prepMinutes: 24, wasOnTime: false },
        { station: "Expo", prepMinutes: 8, wasOnTime: true },
      ],
      generatedAtIso: "2026-06-05T12:00:00.000Z",
    });

    expect(snapshot.performance.ticketsCompletedToday).toBe(3);
    expect(snapshot.performance.avgTicketMinutes).toBe(14.7);
    expect(snapshot.delays.bottleneckStation).toBe("Grill");
    expect(snapshot.efficiency.readyBacklog).toBe(1);
    expect(snapshot.stations.length).toBeGreaterThan(0);
    expect(snapshot.alerts.length).toBeGreaterThan(0);
    expect(snapshot.performance.efficiencyScore).toBeGreaterThan(0);
  });
});
