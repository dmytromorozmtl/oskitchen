import {
  loadKitchenCameraStorage,
  saveKitchenCameraStorage,
} from "@/lib/ai/kitchen-camera-storage";
import {
  analysisConfidence,
  analyzeCameraFrameInput,
  buildCameraFrameAnalysis,
  buildSyntheticDetections,
  summarizeCameraAnalyses,
} from "@/lib/ai/kitchen-camera-builders";
import type {
  CameraAnalysis,
  CameraFrameAnalysis,
  CameraFrameInput,
  KitchenCameraConfig,
  KitchenCameraStorage,
} from "@/lib/ai/kitchen-camera-types";
import { computeStationLoadsFromKdsOrders } from "@/lib/ai/real-time-twin-builders";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId, resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import { resolveOwnerScopedWhere } from "@/lib/scope/workspace-resource-scope";
import { createDigitalTwin } from "@/services/ai/digital-twin";
import { getDailyKdsOrders } from "@/services/kitchen-screen/daily-kds-service";

export type {
  CameraAnalysis,
  CameraFrameAnalysis,
  CameraFrameInput,
  KitchenCameraConfig,
  ActivityLevel,
  EquipmentStatus,
  PpeComplianceStatus,
  DetectedObject,
} from "@/lib/ai/kitchen-camera-types";

function defaultCamerasFromStations(
  stations: { id: string; name: string; capacityUnits: number }[],
): KitchenCameraConfig[] {
  return stations.map((s) => ({
    cameraId: `cam-${s.id.slice(0, 8)}`,
    label: `${s.name} cam`,
    stationName: s.name,
    streamUrl: null,
    enabled: true,
    capacityUnits: Math.max(s.capacityUnits, 1),
  }));
}

/** Load or bootstrap kitchen camera registry for workspace. */
export async function getKitchenCameras(workspaceId: string): Promise<KitchenCameraConfig[]> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) throw new Error(`Workspace not found: ${workspaceId}`);

  const stored = await loadKitchenCameraStorage(ownerUserId);
  if (stored.cameras.length > 0) return stored.cameras.filter((c) => c.enabled);

  const stationScope = await resolveOwnerScopedWhere(ownerUserId);
  const stations = await prisma.productionStation.findMany({
    where: { AND: [stationScope, { active: true }] },
    select: { id: true, name: true, capacityUnits: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    take: 8,
  });

  if (stations.length === 0) {
    const twin = await createDigitalTwin(workspaceId);
    return twin.config.stations.slice(0, 4).map((s, idx) => ({
      cameraId: `cam-default-${idx + 1}`,
      label: `${s.name} cam`,
      stationName: s.name,
      streamUrl: null,
      enabled: true,
      capacityUnits: Math.max(s.capacity, 1),
    }));
  }

  return defaultCamerasFromStations(stations);
}

/**
 * Kitchen Camera AI — on-device object detection framework with queue, activity, PPE, and equipment analysis.
 * Uses live frame detections when provided; falls back to KDS-backed synthetic inference.
 */
export async function analyzeKitchenCameras(workspaceId: string): Promise<CameraAnalysis> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) throw new Error(`Workspace not found: ${workspaceId}`);

  const [cameras, twin, orders] = await Promise.all([
    getKitchenCameras(workspaceId),
    createDigitalTwin(workspaceId),
    getDailyKdsOrders(ownerUserId),
  ]);

  const stationNames = twin.config.stations.map((s) => s.name);
  const loads = computeStationLoadsFromKdsOrders(orders, stationNames);

  const staffByStation = new Map<string, number>();
  for (const member of twin.config.staff) {
    staffByStation.set(member.station, (staffByStation.get(member.station) ?? 0) + 1);
  }

  const frames: CameraFrameAnalysis[] = cameras.map((camera) => {
    const queueLength = loads.get(camera.stationName) ?? 0;
    const staffCount = staffByStation.get(camera.stationName) ?? (queueLength > 0 ? 1 : 0);
    const detections = buildSyntheticDetections({
      queueLength,
      staffCount,
      stationName: camera.stationName,
    });

    return buildCameraFrameAnalysis({ camera, detections, queueLength });
  });

  const summary = summarizeCameraAnalyses(frames);
  const analyzedAt = new Date().toISOString();

  const existing = await loadKitchenCameraStorage(ownerUserId);
  await saveKitchenCameraStorage(ownerUserId, {
    cameras: existing.cameras.length > 0 ? existing.cameras : cameras,
    lastAnalysisAt: analyzedAt,
  });

  return {
    workspaceId,
    analyzedAt,
    cameras: frames,
    summary,
    aiAssisted: true,
    confidence: analysisConfidence(frames, 0),
    dataSource: "synthetic_kds",
  };
}

/** Process on-device detection output for a single camera frame. */
export async function analyzeCameraFrame(
  workspaceId: string,
  frame: CameraFrameInput,
): Promise<CameraFrameAnalysis> {
  const cameras = await getKitchenCameras(workspaceId);
  const analysis = analyzeCameraFrameInput(cameras, frame);
  if (!analysis) {
    throw new Error(`Unknown camera: ${frame.cameraId || frame.stationName}`);
  }
  return analysis;
}

/** Batch analyze with optional live frames — mixed KDS + on-device. */
export async function analyzeKitchenCamerasWithFrames(
  workspaceId: string,
  liveFrames: CameraFrameInput[],
): Promise<CameraAnalysis> {
  const base = await analyzeKitchenCameras(workspaceId);
  if (liveFrames.length === 0) return base;

  const liveByCamera = new Map<string, CameraFrameAnalysis>();
  for (const frame of liveFrames) {
    const analysis = await analyzeCameraFrame(workspaceId, frame);
    liveByCamera.set(analysis.cameraId, analysis);
  }

  const merged = base.cameras.map((cam) => liveByCamera.get(cam.cameraId) ?? cam);
  const summary = summarizeCameraAnalyses(merged);

  return {
    ...base,
    cameras: merged,
    summary,
    confidence: analysisConfidence(merged, liveFrames.length),
    dataSource: liveFrames.length >= merged.length ? "live_frame" : "mixed",
  };
}

export async function analyzeKitchenCamerasForUser(userId: string): Promise<CameraAnalysis> {
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  if (!workspaceId) throw new Error(`No workspace for user: ${userId}`);
  return analyzeKitchenCameras(workspaceId);
}

export async function updateKitchenCameras(
  workspaceId: string,
  cameras: KitchenCameraConfig[],
): Promise<KitchenCameraStorage> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) throw new Error(`Workspace not found: ${workspaceId}`);

  const current = await loadKitchenCameraStorage(ownerUserId);
  const next: KitchenCameraStorage = {
    cameras,
    lastAnalysisAt: current.lastAnalysisAt,
  };
  await saveKitchenCameraStorage(ownerUserId, next);
  return next;
}
