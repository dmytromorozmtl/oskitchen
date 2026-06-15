import type {
  ActivityLevel,
  CameraFrameAnalysis,
  CameraFrameInput,
  DetectedObject,
  EquipmentStatus,
  KitchenCameraConfig,
  PpeCheckResult,
  PpeComplianceStatus,
} from "@/lib/ai/kitchen-camera-types";

const PERSON_LABELS = new Set(["person", "staff", "worker", "chef", "employee"]);
const FOOD_LABELS = new Set(["tray", "plate", "food", "order", "container", "pan"]);
const EQUIPMENT_LABELS = new Set(["oven", "grill", "fryer", "mixer", "equipment", "stove", "fridge"]);
const PPE_LABELS = new Set(["hairnet", "gloves", "apron", "mask", "ppe"]);

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function normalizeLabel(label: string): string {
  return label.trim().toLowerCase();
}

export function categorizeDetection(label: string): DetectedObject["category"] {
  const n = normalizeLabel(label);
  if (PERSON_LABELS.has(n) || n.includes("person")) return "person";
  if (PPE_LABELS.has(n) || n.includes("hairnet") || n.includes("glove") || n.includes("apron")) return "ppe";
  if (FOOD_LABELS.has(n) || n.includes("tray") || n.includes("plate")) return "food";
  if (EQUIPMENT_LABELS.has(n) || n.includes("grill") || n.includes("oven")) return "equipment";
  return "other";
}

export function enrichDetections(detections: DetectedObject[]): DetectedObject[] {
  return detections.map((d) => ({
    ...d,
    category: d.category ?? categorizeDetection(d.label),
  }));
}

export function countStaffFromDetections(detections: DetectedObject[]): number {
  return detections.filter((d) => d.category === "person" && d.confidence >= 0.45).length;
}

export function computeActivityLevel(
  queueLength: number,
  capacityUnits: number,
  staffCount: number,
): ActivityLevel {
  const capacity = Math.max(capacityUnits, 1);
  const staff = Math.max(staffCount, 0);
  const loadRatio = queueLength / capacity;
  const staffPressure = staff <= 0 && queueLength > 0 ? 1.5 : queueLength / Math.max(staff * capacity, 1);

  if (queueLength === 0 && staff <= 1) return "idle";
  if (loadRatio >= 2 || staffPressure >= 2.5) return "overloaded";
  if (loadRatio >= 1.2 || staffPressure >= 1.5) return "busy";
  return "normal";
}

export function checkPpeCompliance(detections: DetectedObject[], staffCount: number): PpeCheckResult {
  const ppeTags = detections.filter((d) => d.category === "ppe" && d.confidence >= 0.5);
  const labels = new Set(ppeTags.map((d) => normalizeLabel(d.label)));

  const hairnet =
    labels.has("hairnet") || [...labels].some((l) => l.includes("hairnet") || l.includes("cap"));
  const gloves = labels.has("gloves") || [...labels].some((l) => l.includes("glove"));
  const apron = labels.has("apron") || [...labels].some((l) => l.includes("apron"));

  const violations: string[] = [];
  if (staffCount > 0) {
    if (!hairnet) violations.push("hairnet_missing");
    if (!gloves) violations.push("gloves_missing");
    if (!apron) violations.push("apron_missing");
  }

  let status: PpeComplianceStatus = "compliant";
  if (staffCount === 0) status = "compliant";
  else if (violations.length >= 2) status = "violation";
  else if (violations.length === 1) status = "partial";

  const present = [hairnet, gloves, apron].filter(Boolean).length;
  const confidence =
    staffCount === 0
      ? 0.55
      : round2(Math.min(0.95, 0.5 + (present / 3) * 0.35 + ppeTags.length * 0.05));

  return { status, hairnet, gloves, apron, confidence, violations };
}

export function inferEquipmentStatus(
  stationName: string,
  activityLevel: ActivityLevel,
  detections: DetectedObject[],
): EquipmentStatus {
  const equipmentHits = detections.filter((d) => d.category === "equipment" && d.confidence >= 0.45);
  const lower = stationName.toLowerCase();

  if (equipmentHits.some((d) => normalizeLabel(d.label).includes("error"))) return "error";
  if (activityLevel === "overloaded" && /grill|fry|oven|hot/i.test(lower)) return "warning";
  if (activityLevel === "idle" && equipmentHits.length === 0) return "idle";
  if (activityLevel === "idle") return "idle";
  if (activityLevel === "normal" || activityLevel === "busy") return "running";
  return "warning";
}

export function buildSyntheticDetections(input: {
  queueLength: number;
  staffCount: number;
  stationName: string;
}): DetectedObject[] {
  const detections: DetectedObject[] = [];
  for (let i = 0; i < input.staffCount; i++) {
    detections.push({ label: "person", confidence: 0.72, category: "person" });
  }
  for (let i = 0; i < Math.min(input.queueLength, 8); i++) {
    detections.push({ label: "tray", confidence: 0.65, category: "food" });
  }
  if (/grill|hot|fry|oven/i.test(input.stationName)) {
    detections.push({ label: "grill", confidence: 0.6, category: "equipment" });
  }
  return detections;
}

export function buildCameraFrameAnalysis(input: {
  camera: KitchenCameraConfig;
  detections: DetectedObject[];
  queueLength: number;
  analyzedAt?: string;
}): CameraFrameAnalysis {
  const detections = enrichDetections(input.detections);
  const staffCount = countStaffFromDetections(detections);
  const activityLevel = computeActivityLevel(input.queueLength, input.camera.capacityUnits, staffCount);
  const ppe = checkPpeCompliance(detections, staffCount);
  const equipmentStatus = inferEquipmentStatus(input.camera.stationName, activityLevel, detections);

  const avgDetectionConfidence =
    detections.length > 0
      ? detections.reduce((s, d) => s + d.confidence, 0) / detections.length
      : 0.5;

  return {
    cameraId: input.camera.cameraId,
    stationName: input.camera.stationName,
    analyzedAt: input.analyzedAt ?? new Date().toISOString(),
    detections,
    queueLength: input.queueLength,
    staffCount,
    activityLevel,
    ppe,
    equipmentStatus,
    frameConfidence: round2(avgDetectionConfidence),
  };
}

export function analyzeCameraFrameInput(
  cameras: KitchenCameraConfig[],
  frame: CameraFrameInput,
): CameraFrameAnalysis | null {
  const camera =
    cameras.find((c) => c.cameraId === frame.cameraId) ??
    cameras.find((c) => c.stationName === frame.stationName);
  if (!camera) return null;

  return buildCameraFrameAnalysis({
    camera: { ...camera, stationName: frame.stationName || camera.stationName },
    detections: frame.detections,
    queueLength: frame.queueLength ?? 0,
    analyzedAt: frame.analyzedAt,
  });
}

export function summarizeCameraAnalyses(frames: CameraFrameAnalysis[]) {
  const active = frames.filter((f) => f.activityLevel !== "idle" || f.queueLength > 0);
  const avgQueue =
    frames.length > 0 ? frames.reduce((s, f) => s + f.queueLength, 0) / frames.length : 0;
  const maxQueue = frames.reduce((m, f) => Math.max(m, f.queueLength), 0);
  const overloadedStations = frames
    .filter((f) => f.activityLevel === "overloaded")
    .map((f) => f.stationName);
  const compliant = frames.filter((f) => f.ppe.status === "compliant").length;
  const ppeCompliancePercent =
    frames.length > 0 ? round2((compliant / frames.length) * 100) : 100;
  const equipmentIssues = frames.filter(
    (f) => f.equipmentStatus === "warning" || f.equipmentStatus === "error",
  ).length;

  const activityBreakdown: Record<ActivityLevel, number> = {
    idle: 0,
    normal: 0,
    busy: 0,
    overloaded: 0,
  };
  for (const f of frames) activityBreakdown[f.activityLevel] += 1;

  return {
    cameraCount: frames.length,
    activeCameras: active.length,
    avgQueueLength: round2(avgQueue),
    maxQueueLength: maxQueue,
    overloadedStations,
    ppeCompliancePercent,
    equipmentIssues,
    activityBreakdown,
  };
}

export function analysisConfidence(frames: CameraFrameAnalysis[], liveFrameCount: number): number {
  if (frames.length === 0) return 0.4;
  const frameConf =
    frames.reduce((s, f) => s + f.frameConfidence, 0) / Math.max(frames.length, 1);
  const liveRatio = liveFrameCount / Math.max(frames.length, 1);
  return round2(Math.min(0.92, 0.45 + frameConf * 0.35 + liveRatio * 0.2));
}
