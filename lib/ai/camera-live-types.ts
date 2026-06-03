import type {
  ActivityLevel,
  CameraDataSource,
  CameraFrameAnalysis,
  KitchenCameraConfig,
} from "@/lib/ai/kitchen-camera-types";
import type { CameraTimelinePoint } from "@/lib/ai/kitchen-camera-dashboard-types";

export type CameraLiveEventType =
  | "queue_spike"
  | "ppe_violation"
  | "ppe_partial"
  | "idle_downtime"
  | "equipment_issue";

export type CameraLiveEvent = {
  id: string;
  type: CameraLiveEventType;
  severity: "critical" | "warning" | "info";
  stationName: string;
  cameraId: string;
  message: string;
  at: string;
};

export type CameraLiveFrame = CameraFrameAnalysis & {
  config: KitchenCameraConfig;
  live: boolean;
};

export type CameraLiveDashboard = {
  workspaceId: string;
  analyzedAt: string;
  dataSource: CameraDataSource;
  confidence: number;
  cameras: CameraLiveFrame[];
  events: CameraLiveEvent[];
  timeline15m: CameraTimelinePoint[];
  summary: {
    liveCameraCount: number;
    ppeCompliancePercent: number;
    idleStations: string[];
    overloadedStations: string[];
    openEvents: number;
  };
  refreshSeconds: number;
};
