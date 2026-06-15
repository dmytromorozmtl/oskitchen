import { describe, expect, it } from "vitest";

import type { CameraTimelinePoint } from "@/lib/ai/kitchen-camera-dashboard-types";
import {
  buildCameraLiveEvents,
  detectIdleDowntimeStations,
} from "@/services/ai/camera-live-service";

describe("camera-live-service", () => {
  it("detects idle downtime from timeline", () => {
    const now = new Date("2026-06-02T12:00:00.000Z");
    const timeline: CameraTimelinePoint[] = [
      {
        at: "2026-06-02T11:56:00.000Z",
        cameraId: "c1",
        stationName: "Grill",
        queueLength: 0,
        activityLevel: "idle",
        staffCount: 0,
      },
      {
        at: "2026-06-02T11:58:00.000Z",
        cameraId: "c1",
        stationName: "Grill",
        queueLength: 0,
        activityLevel: "idle",
        staffCount: 0,
      },
      {
        at: "2026-06-02T11:59:30.000Z",
        cameraId: "c1",
        stationName: "Grill",
        queueLength: 0,
        activityLevel: "idle",
        staffCount: 0,
      },
    ];
    expect(detectIdleDowntimeStations(timeline, 5, now)).toContain("Grill");
  });

  it("builds queue and PPE live events", () => {
    const events = buildCameraLiveEvents({
      frames: [
        {
          cameraId: "c1",
          stationName: "Expo",
          queueLength: 12,
          staffCount: 1,
          activityLevel: "overloaded",
          ppe: { status: "violation", violations: ["gloves_missing"] },
          equipmentStatus: "running",
        },
      ],
      idleStations: [],
      at: new Date("2026-06-02T12:00:00.000Z"),
    });
    expect(events.some((e) => e.type === "queue_spike")).toBe(true);
    expect(events.some((e) => e.type === "ppe_violation")).toBe(true);
  });
});
