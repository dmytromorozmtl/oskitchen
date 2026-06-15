import type {
  ActivityLevel,
  CameraAnalysis,
  CameraFrameAnalysis,
  KitchenCameraConfig,
} from "@/lib/ai/kitchen-camera-types";

export type CameraTimelinePoint = {
  at: string;
  cameraId: string;
  stationName: string;
  queueLength: number;
  activityLevel: ActivityLevel;
  staffCount: number;
};

export type CameraHeatmapCell = {
  hour: number;
  label: string;
  activityScore: number;
  samples: number;
};

export type CameraAlertType =
  | "ppe_violation"
  | "ppe_partial"
  | "equipment_error"
  | "equipment_warning"
  | "overloaded";

export type CameraAlert = {
  id: string;
  type: CameraAlertType;
  severity: "critical" | "warning" | "info";
  stationName: string;
  cameraId: string;
  message: string;
  at: string;
};

export type CameraDashboardFrame = CameraFrameAnalysis & {
  config: KitchenCameraConfig;
};

export type KitchenCameraHistoryStorage = {
  timeline: CameraTimelinePoint[];
};

export type KitchenCameraDashboardPayload = Omit<CameraAnalysis, "cameras"> & {
  cameras: CameraDashboardFrame[];
  alerts: CameraAlert[];
  timeline30m: CameraTimelinePoint[];
  activityHeatmap: CameraHeatmapCell[];
};

export const EMPTY_CAMERA_HISTORY: KitchenCameraHistoryStorage = { timeline: [] };
