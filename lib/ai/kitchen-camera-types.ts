/** Kitchen Camera AI — analysis types (on-device detection + deterministic inference). */

export type ActivityLevel = "idle" | "normal" | "busy" | "overloaded";

export type EquipmentStatus = "offline" | "idle" | "running" | "warning" | "error";

export type PpeComplianceStatus = "compliant" | "partial" | "violation";

export type CameraDataSource = "live_frame" | "synthetic_kds" | "mixed";

/** Bounding box normalized 0–1 for on-device object detection output. */
export type DetectionBBox = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type DetectedObject = {
  label: string;
  confidence: number;
  bbox?: DetectionBBox;
  category?: "person" | "food" | "equipment" | "ppe" | "other";
};

export type PpeCheckResult = {
  status: PpeComplianceStatus;
  hairnet: boolean;
  gloves: boolean;
  apron: boolean;
  /** Model confidence for PPE classification (0–1). */
  confidence: number;
  violations: string[];
};

export type CameraFrameAnalysis = {
  cameraId: string;
  stationName: string;
  analyzedAt: string;
  detections: DetectedObject[];
  queueLength: number;
  staffCount: number;
  activityLevel: ActivityLevel;
  ppe: PpeCheckResult;
  equipmentStatus: EquipmentStatus;
  /** On-device vs inferred — lower when synthetic. */
  frameConfidence: number;
};

export type CameraAnalysis = {
  workspaceId: string;
  analyzedAt: string;
  cameras: CameraFrameAnalysis[];
  summary: {
    cameraCount: number;
    activeCameras: number;
    avgQueueLength: number;
    maxQueueLength: number;
    overloadedStations: string[];
    ppeCompliancePercent: number;
    equipmentIssues: number;
    activityBreakdown: Record<ActivityLevel, number>;
  };
  aiAssisted: true;
  confidence: number;
  dataSource: CameraDataSource;
};

export type KitchenCameraConfig = {
  cameraId: string;
  label: string;
  stationName: string;
  streamUrl: string | null;
  enabled: boolean;
  capacityUnits: number;
};

export type CameraFrameInput = {
  cameraId: string;
  stationName: string;
  analyzedAt?: string;
  detections: DetectedObject[];
  queueLength?: number;
  capacityUnits?: number;
};

export type KitchenCameraStorage = {
  cameras: KitchenCameraConfig[];
  lastAnalysisAt: string | null;
};
