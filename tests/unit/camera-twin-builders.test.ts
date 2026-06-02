import { describe, expect, it } from "vitest";

import {
  applyCameraLoadsToTwinConfig,
  buildKdsStateWithCameraLoads,
  cameraFusionConfidence,
  cameraLoadsFromFrames,
  resolveCameraStationLoads,
} from "@/lib/ai/camera-twin-builders";
import type { KitchenTwinConfig } from "@/lib/ai/digital-twin-types";
import type { KdsLiveState } from "@/lib/ai/real-time-twin-types";

const config: KitchenTwinConfig = {
  stations: [
    { name: "Grill", capacity: 2, currentLoad: 0 },
    { name: "Pack", capacity: 1, currentLoad: 0 },
  ],
  staff: [],
  equipment: [],
};

const baseKds: KdsLiveState = {
  queueDepth: 3,
  highPriorityCount: 0,
  avgWaitMinutes: 5,
  stationLoads: [
    { station: "Grill", load: 2 },
    { station: "Pack", load: 1 },
  ],
  orders: [],
  updatedAt: new Date().toISOString(),
};

describe("cameraLoadsFromFrames", () => {
  it("maps station to queue length", () => {
    const map = cameraLoadsFromFrames([
      { stationName: "Grill", queueLength: 5 },
      { stationName: "Pack", queueLength: 1 },
    ]);
    expect(map.get("Grill")).toBe(5);
  });
});

describe("resolveCameraStationLoads", () => {
  it("prefers camera over KDS", () => {
    const loads = resolveCameraStationLoads({
      stationNames: ["Grill", "Pack"],
      cameraLoads: new Map([["Grill", 6]]),
      kdsLoads: new Map([
        ["Grill", 2],
        ["Pack", 1],
      ]),
    });
    expect(loads.find((l) => l.station === "Grill")).toMatchObject({ queueLength: 6, source: "camera" });
    expect(loads.find((l) => l.station === "Pack")?.source).toBe("kds_fallback");
  });
});

describe("applyCameraLoadsToTwinConfig", () => {
  it("sets station currentLoad from camera data", () => {
    const updated = applyCameraLoadsToTwinConfig(config, [
      { station: "Grill", queueLength: 4, source: "camera" },
      { station: "Pack", queueLength: 0, source: "kds_fallback" },
    ]);
    expect(updated.stations[0]!.currentLoad).toBe(4);
    expect(updated.stations[1]!.currentLoad).toBe(0);
  });
});

describe("buildKdsStateWithCameraLoads", () => {
  it("fuses camera loads into KDS state", () => {
    const fused = buildKdsStateWithCameraLoads(
      baseKds,
      [
        { station: "Grill", queueLength: 7, source: "camera" },
        { station: "Pack", queueLength: 1, source: "kds_fallback" },
      ],
      ["Grill", "Pack"],
    );
    expect(fused.stationLoads.find((s) => s.station === "Grill")?.load).toBe(7);
    expect(fused.queueDepth).toBeGreaterThanOrEqual(8);
  });
});

describe("cameraFusionConfidence", () => {
  it("increases with camera coverage", () => {
    expect(
      cameraFusionConfidence([
        { station: "Grill", queueLength: 1, source: "camera" },
        { station: "Pack", queueLength: 1, source: "camera" },
      ]),
    ).toBeGreaterThan(
      cameraFusionConfidence([{ station: "Grill", queueLength: 1, source: "kds_fallback" }]),
    );
  });
});
