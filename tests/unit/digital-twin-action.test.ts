import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/scope/cached-tenant", () => ({
  getTenantActor: vi.fn().mockResolvedValue({ workspaceId: "ws-1", dataUserId: "user-1" }),
}));

vi.mock("@/services/ai/digital-twin", () => ({
  runKitchenSimulation: vi.fn().mockResolvedValue({
    bottleneckStation: "Hot line",
    bottleneckDelay: 12,
    totalTime: 55,
    stationUtilization: [],
    waitTimes: [],
    recommendations: ["AI-assisted simulation"],
    aiAssisted: true,
    confidence: 0.8,
  }),
}));

describe("runDigitalTwinScenarioAction", () => {
  it("clamps order count to 50-500", async () => {
    const { runDigitalTwinScenarioAction } = await import("@/actions/digital-twin");
    const { runKitchenSimulation } = await import("@/services/ai/digital-twin");

    await runDigitalTwinScenarioAction({
      orderCount: 999,
      timeWindow: 60,
      menuMix: [{ item: "Burger", percentage: 100 }],
    });

    expect(runKitchenSimulation).toHaveBeenCalledWith(
      "ws-1",
      expect.objectContaining({ orderCount: 500, timeWindow: 60 }),
    );
  });
});
