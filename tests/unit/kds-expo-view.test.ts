import { describe, expect, it } from "vitest";

import {
  buildExpoViewSnapshot,
  isExpoReadyStatus,
  isExpoTicketDelayed,
  isExpoWaitingStatus,
  KDS_EXPO_VIEW_ROUTE,
  resolveExpoLane,
} from "@/lib/kitchen/kds-expo-view";
import {
  KDS_EXPO_VIEW_COMPONENT,
  KDS_EXPO_VIEW_POLICY_ID,
  KDS_EXPO_VIEW_ROUTE as POLICY_ROUTE,
} from "@/lib/kitchen/kds-expo-view-policy";
import { KDS_OVERDUE_SECONDS } from "@/lib/kitchen/kds-queue-clarity-era18";

const NOW = new Date("2026-06-05T12:00:00.000Z");

function ticket(overrides: Partial<Parameters<typeof buildExpoViewSnapshot>[0][number]> = {}) {
  return {
    id: overrides.id ?? "order-1",
    kind: overrides.kind ?? "order",
    title: overrides.title ?? "Alex",
    subtitle: overrides.subtitle ?? null,
    status: overrides.status ?? "PREPARING",
    elapsedSeconds: overrides.elapsedSeconds ?? 120,
    dueAtIso: overrides.dueAtIso ?? null,
    tableName: overrides.tableName ?? null,
    itemSummary: overrides.itemSummary ?? "Burger, Fries",
    priority: overrides.priority ?? "normal",
  };
}

describe("KDS expo view", () => {
  it("locks policy constants", () => {
    expect(KDS_EXPO_VIEW_POLICY_ID).toBe("kds-expo-view-v1");
    expect(KDS_EXPO_VIEW_ROUTE).toBe("/dashboard/kitchen/expo");
    expect(POLICY_ROUTE).toBe(KDS_EXPO_VIEW_ROUTE);
    expect(KDS_EXPO_VIEW_COMPONENT).toContain("expo-view-client");
  });

  it("classifies ready and waiting statuses", () => {
    expect(isExpoReadyStatus("READY")).toBe(true);
    expect(isExpoReadyStatus("HANDOFF")).toBe(true);
    expect(isExpoWaitingStatus("PREPARING")).toBe(true);
    expect(isExpoWaitingStatus("IN_PROGRESS")).toBe(true);
  });

  it("flags delayed tickets by elapsed threshold", () => {
    expect(
      isExpoTicketDelayed(
        { elapsedSeconds: KDS_OVERDUE_SECONDS, dueAtIso: null, status: "PREPARING" },
        NOW.getTime(),
      ),
    ).toBe(true);
    expect(resolveExpoLane({ status: "READY", elapsedSeconds: KDS_OVERDUE_SECONDS, dueAtIso: null }, NOW.getTime())).toBe(
      "delayed",
    );
  });

  it("partitions tickets into ready, waiting, and delayed lanes", () => {
    const snapshot = buildExpoViewSnapshot(
      [
        ticket({ id: "ready-1", status: "READY", elapsedSeconds: 300 }),
        ticket({ id: "wait-1", status: "PREPARING", elapsedSeconds: 400 }),
        ticket({ id: "late-1", status: "PREPARING", elapsedSeconds: KDS_OVERDUE_SECONDS + 30 }),
      ],
      { now: NOW },
    );

    expect(snapshot.totalTickets).toBe(3);
    expect(snapshot.lanes.find((lane) => lane.lane === "ready")?.count).toBe(1);
    expect(snapshot.lanes.find((lane) => lane.lane === "waiting")?.count).toBe(1);
    expect(snapshot.lanes.find((lane) => lane.lane === "delayed")?.count).toBe(1);
  });

  it("sorts lanes oldest-first by elapsed time", () => {
    const snapshot = buildExpoViewSnapshot(
      [
        ticket({ id: "a", status: "READY", elapsedSeconds: 100 }),
        ticket({ id: "b", status: "READY", elapsedSeconds: 600 }),
      ],
      { now: NOW },
    );
    const ready = snapshot.lanes.find((lane) => lane.lane === "ready");
    expect(ready?.tickets[0]?.id).toBe("b");
  });
});
