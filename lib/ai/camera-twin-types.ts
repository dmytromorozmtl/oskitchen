import type { CameraAnalysis, CameraFrameAnalysis } from "@/lib/ai/kitchen-camera-types";
import type { KitchenTwinConfig } from "@/lib/ai/digital-twin-types";
import type { KdsLiveState, KdsTwinPredictions, RealTimeTwinUpdate } from "@/lib/ai/real-time-twin-types";

export type CameraLoadSource = "camera" | "kds_fallback";

export type CameraStationLoad = {
  station: string;
  queueLength: number;
  source: CameraLoadSource;
};

export type CameraTwinUpdate = RealTimeTwinUpdate & {
  cameraAnalysis: CameraAnalysis;
  cameraLoadsApplied: CameraStationLoad[];
  fusionSource: "camera_kds";
};

export type CameraTwinSnapshot = {
  workspaceId: string;
  updatedAt: string;
  cameraLoadsApplied: CameraStationLoad[];
  predictions: KdsTwinPredictions;
};
