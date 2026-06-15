import { beforeEach, describe, expect, it, vi } from "vitest";

import { updateTwinWithCameraData } from "@/services/ai/camera-twin-integration";

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveWorkspaceOwnerUserId: vi.fn(),
  resolveOwnerWorkspaceId: vi.fn(),
}));

vi.mock("@/services/ai/kitchen-camera", () => ({
  analyzeKitchenCameras: vi.fn().mockResolvedValue({
    workspaceId: "ws-1",
    analyzedAt: new Date().toISOString(),
    cameras: [
      {
        cameraId: "cam-1",
        stationName: "Grill",
        queueLength: 6,
        staffCount: 2,
        activityLevel: "overloaded",
        equipmentStatus: "warning",
        detections: [],
        ppe: { status: "compliant", hairnet: true, gloves: true, apron: true, confidence: 0.9, violations: [] },
        frameConfidence: 0.85,
        analyzedAt: new Date().toISOString(),
      },
    ],
    summary: {
      cameraCount: 1,
      activeCameras: 1,
      avgQueueLength: 6,
      maxQueueLength: 6,
      overloadedStations: ["Grill"],
      ppeCompliancePercent: 100,
      equipmentIssues: 1,
      activityBreakdown: { idle: 0, normal: 0, busy: 0, overloaded: 1 },
    },
    aiAssisted: true,
    confidence: 0.8,
    dataSource: "synthetic_kds",
  }),
}));

vi.mock("@/services/ai/real-time-twin", () => ({
  getCurrentKDSState: vi.fn().mockResolvedValue({
    queueDepth: 2,
    highPriorityCount: 0,
    avgWaitMinutes: 4,
    stationLoads: [{ station: "Grill", load: 2 }],
    orders: [{ id: "o1", items: ["Burger"], elapsedSeconds: 240, priority: "normal" }],
    updatedAt: new Date().toISOString(),
  }),
  getCurrentPOSOrders: vi.fn().mockResolvedValue({
    ordersLastHour: 10,
    incomingRatePerHour: 10,
    menuMix: [{ item: "Burger", percentage: 100 }],
    updatedAt: new Date().toISOString(),
  }),
  persistKDSPredictions: vi.fn().mockResolvedValue(undefined),
  sendTwinBottleneckAlert: vi.fn().mockResolvedValue({ sent: false }),
}));

vi.mock("@/services/ai/digital-twin", () => ({
  createDigitalTwin: vi.fn().mockResolvedValue({
    config: {
      stations: [
        { name: "Grill", capacity: 2, currentLoad: 0 },
        { name: "Pack", capacity: 1, currentLoad: 0 },
      ],
      staff: [{ name: "Alex", station: "Grill", efficiency: 0.9 }],
      equipment: [{ name: "Grill", station: "Grill", throughput: 1.1 }],
    },
    simulate: vi.fn(),
  }),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    kitchenSettings: {
      findUnique: vi.fn().mockResolvedValue({ settingsCenterJson: {} }),
      upsert: vi.fn().mockResolvedValue({}),
    },
  },
}));

describe("camera twin integration (integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates twin with camera queue loads and persists predictions", async () => {
    const { resolveWorkspaceOwnerUserId } = await import("@/lib/scope/resolve-owner-workspace-id");
    vi.mocked(resolveWorkspaceOwnerUserId).mockResolvedValue("user-1");

    const { persistKDSPredictions } = await import("@/services/ai/real-time-twin");
    const result = await updateTwinWithCameraData("ws-1");

    expect(result.fusionSource).toBe("camera_kds");
    expect(result.cameraLoadsApplied.find((l) => l.station === "Grill")?.queueLength).toBe(6);
    expect(result.cameraLoadsApplied.find((l) => l.station === "Grill")?.source).toBe("camera");
    expect(result.kdsState.stationLoads.find((s) => s.station === "Grill")?.load).toBe(6);
    expect(result.predictions.bottleneckStation).toBeTruthy();
    expect(vi.mocked(persistKDSPredictions)).toHaveBeenCalledOnce();
  });
});
