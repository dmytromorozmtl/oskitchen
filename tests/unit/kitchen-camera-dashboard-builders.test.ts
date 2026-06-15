import { describe, expect, it } from "vitest";

import {
  buildActivityHeatmap,
  buildCameraAlerts,
  buildSyntheticTimeline30m,
  heatmapTone,
  mergeTimelineHistory,
} from "@/lib/ai/kitchen-camera-dashboard-builders";
import type { CameraFrameAnalysis } from "@/lib/ai/kitchen-camera-types";

const frame: CameraFrameAnalysis = {
  cameraId: "cam-1",
  stationName: "Grill",
  analyzedAt: new Date().toISOString(),
  detections: [],
  queueLength: 5,
  staffCount: 1,
  activityLevel: "overloaded",
  ppe: {
    status: "violation",
    hairnet: false,
    gloves: false,
    apron: false,
    confidence: 0.7,
    violations: ["hairnet_missing", "gloves_missing"],
  },
  equipmentStatus: "warning",
  frameConfidence: 0.8,
};

describe("buildCameraAlerts", () => {
  it("creates alerts for PPE and overload", () => {
    const alerts = buildCameraAlerts([frame]);
    expect(alerts.length).toBeGreaterThanOrEqual(2);
    expect(alerts.some((a) => a.type === "ppe_violation")).toBe(true);
    expect(alerts.some((a) => a.type === "overloaded")).toBe(true);
  });
});

describe("mergeTimelineHistory", () => {
  it("trims points older than 30 minutes", () => {
    const old = new Date(Date.now() - 40 * 60 * 1000).toISOString();
    const merged = mergeTimelineHistory(
      [{ at: old, cameraId: "c1", stationName: "Grill", queueLength: 1, activityLevel: "normal", staffCount: 1 }],
      [{ at: new Date().toISOString(), cameraId: "c1", stationName: "Grill", queueLength: 2, activityLevel: "busy", staffCount: 1 }],
    );
    expect(merged).toHaveLength(1);
    expect(merged[0]!.queueLength).toBe(2);
  });
});

describe("buildSyntheticTimeline30m", () => {
  it("generates timeline points per camera", () => {
    const points = buildSyntheticTimeline30m([frame]);
    expect(points.length).toBeGreaterThan(0);
    expect(points.every((p) => p.cameraId === "cam-1")).toBe(true);
  });
});

describe("buildActivityHeatmap", () => {
  it("returns hourly cells", () => {
    const points = buildSyntheticTimeline30m([frame]);
    const heatmap = buildActivityHeatmap(points);
    expect(heatmap.length).toBe(8);
  });
});

describe("heatmapTone", () => {
  it("maps scores to colors", () => {
    expect(heatmapTone(80)).toBe("red");
    expect(heatmapTone(50)).toBe("yellow");
    expect(heatmapTone(20)).toBe("green");
  });
});
