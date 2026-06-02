import { describe, expect, it } from "vitest";

import {
  analyzeCameraFrameInput,
  buildCameraFrameAnalysis,
  checkPpeCompliance,
  computeActivityLevel,
  countStaffFromDetections,
  enrichDetections,
  inferEquipmentStatus,
  summarizeCameraAnalyses,
} from "@/lib/ai/kitchen-camera-builders";
import type { KitchenCameraConfig } from "@/lib/ai/kitchen-camera-types";

const camera: KitchenCameraConfig = {
  cameraId: "cam-1",
  label: "Grill cam",
  stationName: "Grill",
  streamUrl: null,
  enabled: true,
  capacityUnits: 2,
};

describe("computeActivityLevel", () => {
  it("returns idle when empty queue", () => {
    expect(computeActivityLevel(0, 2, 1)).toBe("idle");
  });

  it("returns overloaded under heavy load", () => {
    expect(computeActivityLevel(6, 2, 1)).toBe("overloaded");
  });

  it("returns busy at moderate load", () => {
    expect(computeActivityLevel(3, 2, 2)).toBe("busy");
  });
});

describe("checkPpeCompliance", () => {
  it("flags violations when staff present without PPE", () => {
    const result = checkPpeCompliance(
      enrichDetections([{ label: "person", confidence: 0.9 }]),
      1,
    );
    expect(result.status).toBe("violation");
    expect(result.violations.length).toBeGreaterThan(0);
  });

  it("passes when all PPE detected", () => {
    const result = checkPpeCompliance(
      enrichDetections([
        { label: "person", confidence: 0.9 },
        { label: "hairnet", confidence: 0.85 },
        { label: "gloves", confidence: 0.8 },
        { label: "apron", confidence: 0.82 },
      ]),
      1,
    );
    expect(result.status).toBe("compliant");
  });
});

describe("buildCameraFrameAnalysis", () => {
  it("builds full frame analysis from detections", () => {
    const frame = buildCameraFrameAnalysis({
      camera,
      queueLength: 4,
      detections: [
        { label: "person", confidence: 0.88 },
        { label: "tray", confidence: 0.7 },
        { label: "grill", confidence: 0.75 },
      ],
    });

    expect(frame.staffCount).toBe(1);
    expect(frame.queueLength).toBe(4);
    expect(frame.activityLevel).toBe("overloaded");
    expect(frame.equipmentStatus).toBe("warning");
  });
});

describe("analyzeCameraFrameInput", () => {
  it("matches camera by id", () => {
    const result = analyzeCameraFrameInput([camera], {
      cameraId: "cam-1",
      stationName: "Grill",
      detections: [{ label: "person", confidence: 0.9 }],
      queueLength: 1,
    });
    expect(result?.cameraId).toBe("cam-1");
  });
});

describe("summarizeCameraAnalyses", () => {
  it("computes PPE compliance percent", () => {
    const frames = [
      buildCameraFrameAnalysis({
        camera,
        queueLength: 0,
        detections: [{ label: "person", confidence: 0.9 }],
      }),
      buildCameraFrameAnalysis({
        camera: { ...camera, cameraId: "cam-2", stationName: "Pack" },
        queueLength: 0,
        detections: [
          { label: "person", confidence: 0.9 },
          { label: "hairnet", confidence: 0.9 },
          { label: "gloves", confidence: 0.9 },
          { label: "apron", confidence: 0.9 },
        ],
      }),
    ];
    const summary = summarizeCameraAnalyses(frames);
    expect(summary.cameraCount).toBe(2);
    expect(summary.ppeCompliancePercent).toBe(50);
  });
});

describe("countStaffFromDetections", () => {
  it("counts person detections above threshold", () => {
    expect(
      countStaffFromDetections(
        enrichDetections([
          { label: "person", confidence: 0.9 },
          { label: "person", confidence: 0.5 },
        ]),
      ),
    ).toBe(2);
  });
});

describe("inferEquipmentStatus", () => {
  it("warns on overloaded grill station", () => {
    expect(inferEquipmentStatus("Grill", "overloaded", [])).toBe("warning");
  });
});
