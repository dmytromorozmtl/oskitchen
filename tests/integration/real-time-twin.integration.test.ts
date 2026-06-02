import { describe, expect, it, vi } from "vitest";

import {
  getCurrentKDSState,
  getCurrentPOSOrders,
  getKDSPredictions,
  updateRealTimeTwin,
} from "@/services/ai/real-time-twin";

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveWorkspaceOwnerUserId: vi.fn(),
  resolveOwnerWorkspaceId: vi.fn(),
}));

vi.mock("@/lib/scope/workspace-resource-scope", () => ({
  resolveOwnerScopedWhere: vi.fn().mockResolvedValue({ userId: "user-1" }),
  orderListWhereForOwnerAnd: vi.fn().mockResolvedValue({ userId: "user-1" }),
}));

vi.mock("@/services/kitchen-screen/daily-kds-service", () => ({
  getDailyKdsOrders: vi.fn().mockResolvedValue([
    {
      id: "o1",
      customerName: "Table 4",
      items: ["Burger", "Fries"],
      status: "IN_KITCHEN",
      createdAt: new Date().toISOString(),
      priority: "high",
      elapsedSeconds: 900,
    },
  ]),
}));

const settingsJson: Record<string, unknown> = {
  operations: { stations: ["Grill", "Fry", "Expo"] },
};

vi.mock("@/lib/prisma", () => ({
  prisma: {
    productionStation: { findMany: vi.fn().mockResolvedValue([]) },
    kitchenSettings: {
      findUnique: vi.fn().mockImplementation(() =>
        Promise.resolve({ settingsCenterJson: settingsJson, timezone: "UTC" }),
      ),
      upsert: vi.fn().mockImplementation(async ({ update }) => {
        Object.assign(settingsJson, update.settingsCenterJson ?? {});
        return { userId: "user-1" };
      }),
    },
    staffMember: {
      findMany: vi.fn().mockResolvedValue([{ id: "s1", name: "Alex", roleType: "LINE_COOK" }]),
    },
    staffShift: { findMany: vi.fn().mockResolvedValue([]) },
    order: {
      findMany: vi.fn().mockResolvedValue([
        {
          orderItems: [{ title: "Burger", quantity: 2, product: { title: "Classic Burger" } }],
        },
        {
          orderItems: [{ title: "Fries", quantity: 1, product: null }],
        },
      ]),
    },
    userProfile: {
      findUnique: vi.fn().mockResolvedValue({ email: "owner@kitchen.test" }),
    },
    notificationLog: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: "log-1" }),
    },
  },
}));

describe("real-time twin service (integration)", () => {
  it("reads live KDS state for workspace", async () => {
    const { resolveWorkspaceOwnerUserId } = await import("@/lib/scope/resolve-owner-workspace-id");
    vi.mocked(resolveWorkspaceOwnerUserId).mockResolvedValue("user-1");

    const state = await getCurrentKDSState("ws-1");
    expect(state.queueDepth).toBe(1);
    expect(state.stationLoads.length).toBe(3);
  });

  it("reads POS snapshot with menu mix", async () => {
    const { resolveWorkspaceOwnerUserId } = await import("@/lib/scope/resolve-owner-workspace-id");
    vi.mocked(resolveWorkspaceOwnerUserId).mockResolvedValue("user-1");

    const pos = await getCurrentPOSOrders("ws-1");
    expect(pos.ordersLastHour).toBe(2);
    expect(pos.menuMix.length).toBeGreaterThan(0);
  });

  it("updates twin, persists predictions, and returns alert status", async () => {
    const { resolveWorkspaceOwnerUserId } = await import("@/lib/scope/resolve-owner-workspace-id");
    vi.mocked(resolveWorkspaceOwnerUserId).mockResolvedValue("user-1");

    const result = await updateRealTimeTwin("ws-1");
    expect(result.predictions.workspaceId).toBe("ws-1");
    expect(result.predictions.stationPredictions.length).toBeGreaterThan(0);
    expect(typeof result.alertSent).toBe("boolean");

    const stored = await getKDSPredictions("ws-1");
    expect(stored?.workspaceId).toBe("ws-1");
    expect(stored?.bottleneckStation).toBeTruthy();
  });
});
