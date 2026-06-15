import { describe, expect, it, vi } from "vitest";

import { analyzeKitchenCameras, analyzeCameraFrame } from "@/services/ai/kitchen-camera";

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveWorkspaceOwnerUserId: vi.fn(),
  resolveOwnerWorkspaceId: vi.fn(),
}));

vi.mock("@/lib/scope/workspace-resource-scope", () => ({
  resolveOwnerScopedWhere: vi.fn().mockResolvedValue({ userId: "user-1" }),
}));

vi.mock("@/lib/ai/kitchen-camera-storage", () => ({
  loadKitchenCameraStorage: vi.fn().mockResolvedValue({ cameras: [], lastAnalysisAt: null }),
  saveKitchenCameraStorage: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/services/ai/digital-twin", () => ({
  createDigitalTwin: vi.fn().mockResolvedValue({
    config: {
      stations: [
        { name: "Grill", capacity: 2, currentLoad: 0 },
        { name: "Pack", capacity: 1, currentLoad: 0 },
      ],
      staff: [{ name: "Alex", station: "Grill", efficiency: 0.9 }],
      equipment: [],
    },
  }),
}));

vi.mock("@/services/kitchen-screen/daily-kds-service", () => ({
  getDailyKdsOrders: vi.fn().mockResolvedValue([
    {
      id: "o1",
      items: ["Burger", "Fries"],
      elapsedSeconds: 600,
      priority: "normal",
    },
    {
      id: "o2",
      items: ["Salad"],
      elapsedSeconds: 300,
      priority: "high",
    },
  ]),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    productionStation: {
      findMany: vi.fn().mockResolvedValue([
        { id: "st-1", name: "Grill", capacityUnits: 2 },
        { id: "st-2", name: "Pack", capacityUnits: 1 },
      ]),
    },
  },
}));

describe("kitchen camera service (integration)", () => {
  it("analyzes all kitchen cameras with KDS-backed inference", async () => {
    const { resolveWorkspaceOwnerUserId } = await import("@/lib/scope/resolve-owner-workspace-id");
    vi.mocked(resolveWorkspaceOwnerUserId).mockResolvedValue("user-1");

    const result = await analyzeKitchenCameras("ws-1");

    expect(result.workspaceId).toBe("ws-1");
    expect(result.cameras.length).toBeGreaterThan(0);
    expect(result.summary.cameraCount).toBe(result.cameras.length);
    expect(result.dataSource).toBe("synthetic_kds");
    expect(result.aiAssisted).toBe(true);
    expect(result.cameras[0]!.queueLength).toBeGreaterThanOrEqual(0);
  });

  it("processes on-device frame detections", async () => {
    const { resolveWorkspaceOwnerUserId } = await import("@/lib/scope/resolve-owner-workspace-id");
    vi.mocked(resolveWorkspaceOwnerUserId).mockResolvedValue("user-1");

    const { getKitchenCameras } = await import("@/services/ai/kitchen-camera");
    const cameras = await getKitchenCameras("ws-1");
    const cam = cameras[0]!;

    const frame = await analyzeCameraFrame("ws-1", {
      cameraId: cam.cameraId,
      stationName: cam.stationName,
      detections: [
        { label: "person", confidence: 0.92 },
        { label: "hairnet", confidence: 0.88 },
        { label: "gloves", confidence: 0.86 },
        { label: "apron", confidence: 0.84 },
      ],
      queueLength: 2,
    });

    expect(frame.ppe.status).toBe("compliant");
    expect(frame.staffCount).toBe(1);
  });
});
