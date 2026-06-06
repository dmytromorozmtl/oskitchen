import { describe, expect, it, vi } from "vitest";

import { createDigitalTwin, runKitchenSimulation } from "@/services/ai/digital-twin";

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveWorkspaceOwnerUserId: vi.fn(),
  resolveOwnerWorkspaceId: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    productionStation: { findMany: vi.fn().mockResolvedValue([]) },
    kitchenSettings: {
      findUnique: vi.fn().mockResolvedValue({
        settingsCenterJson: {
          operations: { stations: ["Grill", "Fry", "Expo"] },
        },
      }),
    },
    staffMember: {
      findMany: vi.fn().mockResolvedValue([
        { id: "s1", name: "Alex", roleType: "LINE_COOK" },
        { id: "s2", name: "Jordan", roleType: "KITCHEN_LEAD" },
      ]),
    },
    staffShift: { findMany: vi.fn().mockResolvedValue([]) },
  },
}));

vi.mock("@/lib/scope/workspace-resource-scope", () => ({
  resolveOwnerScopedWhere: vi.fn().mockResolvedValue({ userId: "user-1" }),
  orderListWhereForOwner: vi.fn().mockResolvedValue({ userId: "user-1" }),
}));

vi.mock("@/services/ai/digital-twin-data-gate-service", () => ({
  loadDigitalTwinDataGate: vi.fn().mockResolvedValue({
    gateStatus: "open",
    confidenceCap: 1,
    reasons: [],
    snapshot: {
      productionStationCount: 3,
      activeStaffCount: 2,
      todayShiftCount: 1,
      ordersLast30Days: 10,
      menuMixSynthetic: false,
    },
  }),
}));

describe("digital twin service (integration)", () => {
  it("creates a twin with simulate()", async () => {
    const { resolveWorkspaceOwnerUserId } = await import("@/lib/scope/resolve-owner-workspace-id");
    vi.mocked(resolveWorkspaceOwnerUserId).mockResolvedValue("user-1");

    const twin = await createDigitalTwin("ws-1");
    expect(twin.config.stations.length).toBeGreaterThan(0);
    expect(twin.config.staff.length).toBeGreaterThan(0);

    const result = twin.simulate({
      orderCount: 40,
      timeWindow: 60,
      menuMix: [{ item: "Burger", percentage: 100 }],
    });

    expect(result.bottleneckStation).toBeTruthy();
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it("runs scenario via runKitchenSimulation helper", async () => {
    const { resolveWorkspaceOwnerUserId } = await import("@/lib/scope/resolve-owner-workspace-id");
    vi.mocked(resolveWorkspaceOwnerUserId).mockResolvedValue("user-1");

    const result = await runKitchenSimulation("ws-1", {
      orderCount: 20,
      timeWindow: 30,
      menuMix: [{ item: "Tacos", percentage: 100 }],
    });

    expect(result.totalTime).toBeGreaterThanOrEqual(0);
  });
});
