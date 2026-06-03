import type { Prisma } from "@prisma/client";
import { subMinutes } from "date-fns";

import type {
  CameraLiveDashboard,
  CameraLiveEvent,
  CameraLiveEventType,
} from "@/lib/ai/camera-live-types";
import {
  attachCameraConfig,
  framesToTimelinePoints,
} from "@/lib/ai/kitchen-camera-dashboard-builders";
import type { CameraTimelinePoint } from "@/lib/ai/kitchen-camera-dashboard-types";
import type { ActivityLevel, CameraFrameInput } from "@/lib/ai/kitchen-camera-types";
import { prisma } from "@/lib/prisma";
import { resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import {
  loadKitchenCameraHistory,
  saveKitchenCameraHistory,
} from "@/lib/ai/kitchen-camera-storage";
import {
  analyzeKitchenCameras,
  analyzeKitchenCamerasWithFrames,
  getKitchenCameras,
} from "@/services/ai/kitchen-camera";

const LIVE_EVENTS_KEY = "cameraLiveEvents";
const MAX_EVENTS = 48;
export const CAMERA_LIVE_REFRESH_SECONDS = 30;

export type CameraLiveEventsStorage = {
  events: CameraLiveEvent[];
};

function slugEvent(type: CameraLiveEventType, cameraId: string, at: string): string {
  return `${type}-${cameraId}-${at.slice(0, 16)}`;
}

export function detectIdleDowntimeStations(
  timeline: CameraTimelinePoint[],
  idleMinutes = 5,
  now = new Date(),
): string[] {
  const cutoff = subMinutes(now, 15);
  const byStation = new Map<string, CameraTimelinePoint[]>();

  for (const point of timeline) {
    if (new Date(point.at) < cutoff) continue;
    const list = byStation.get(point.stationName) ?? [];
    list.push(point);
    byStation.set(point.stationName, list);
  }

  const idleStations: string[] = [];
  const requiredPoints = Math.max(2, Math.ceil(idleMinutes / 2));

  for (const [station, points] of byStation) {
    const recent = points
      .filter((p) => new Date(p.at) >= subMinutes(now, idleMinutes))
      .sort((a, b) => a.at.localeCompare(b.at));
    if (recent.length < requiredPoints) continue;
    if (recent.every((p) => p.activityLevel === "idle" && p.queueLength === 0)) {
      idleStations.push(station);
    }
  }

  return idleStations;
}

export function buildCameraLiveEvents(input: {
  frames: { cameraId: string; stationName: string; queueLength: number; staffCount: number; activityLevel: ActivityLevel; ppe: { status: string; violations: string[] }; equipmentStatus: string }[];
  idleStations: string[];
  at?: Date;
}): CameraLiveEvent[] {
  const at = (input.at ?? new Date()).toISOString();
  const events: CameraLiveEvent[] = [];

  for (const frame of input.frames) {
    if (frame.ppe.status === "violation") {
      events.push({
        id: slugEvent("ppe_violation", frame.cameraId, at),
        type: "ppe_violation",
        severity: "critical",
        stationName: frame.stationName,
        cameraId: frame.cameraId,
        message: `PPE violation — ${frame.ppe.violations.join(", ").replace(/_/g, " ")}`,
        at,
      });
    } else if (frame.ppe.status === "partial") {
      events.push({
        id: slugEvent("ppe_partial", frame.cameraId, at),
        type: "ppe_partial",
        severity: "warning",
        stationName: frame.stationName,
        cameraId: frame.cameraId,
        message: "Partial PPE compliance on camera",
        at,
      });
    }

    if (frame.equipmentStatus === "error" || frame.equipmentStatus === "warning") {
      events.push({
        id: slugEvent("equipment_issue", frame.cameraId, at),
        type: "equipment_issue",
        severity: frame.equipmentStatus === "error" ? "critical" : "warning",
        stationName: frame.stationName,
        cameraId: frame.cameraId,
        message:
          frame.equipmentStatus === "error"
            ? "Equipment fault detected on CV feed"
            : "Equipment under stress — verify grill/fryer",
        at,
      });
    }

    if (frame.activityLevel === "overloaded") {
      events.push({
        id: slugEvent("queue_spike", frame.cameraId, at),
        type: "queue_spike",
        severity: "warning",
        stationName: frame.stationName,
        cameraId: frame.cameraId,
        message: `Queue spike — ${frame.queueLength} tickets, ${frame.staffCount} staff visible`,
        at,
      });
    }
  }

  for (const station of input.idleStations) {
    const frame = input.frames.find((f) => f.stationName === station);
    events.push({
      id: slugEvent("idle_downtime", frame?.cameraId ?? station, at),
      type: "idle_downtime",
      severity: "info",
      stationName: station,
      cameraId: frame?.cameraId ?? station,
      message: `Station idle ${Math.round(5)}+ min with empty queue — possible downtime`,
      at,
    });
  }

  return events;
}

function mergeEvents(existing: CameraLiveEvent[], fresh: CameraLiveEvent[]): CameraLiveEvent[] {
  const map = new Map<string, CameraLiveEvent>();
  for (const e of [...existing, ...fresh]) {
    map.set(e.id, e);
  }
  return [...map.values()]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, MAX_EVENTS);
}

async function loadLiveEvents(ownerUserId: string): Promise<CameraLiveEventsStorage> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });
  const center = kitchen?.settingsCenterJson;
  if (!center || typeof center !== "object" || Array.isArray(center)) {
    return { events: [] };
  }
  const raw = (center as Record<string, unknown>)[LIVE_EVENTS_KEY];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { events: [] };
  const events = (raw as { events?: unknown }).events;
  if (!Array.isArray(events)) return { events: [] };
  return { events: events as CameraLiveEvent[] };
}

async function saveLiveEvents(ownerUserId: string, storage: CameraLiveEventsStorage): Promise<void> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });
  const existing =
    kitchen?.settingsCenterJson &&
    typeof kitchen.settingsCenterJson === "object" &&
    !Array.isArray(kitchen.settingsCenterJson)
      ? { ...(kitchen.settingsCenterJson as Record<string, unknown>) }
      : {};

  existing[LIVE_EVENTS_KEY] = storage;

  await prisma.kitchenSettings.upsert({
    where: { userId: ownerUserId },
    create: {
      userId: ownerUserId,
      settingsCenterJson: existing as Prisma.InputJsonValue,
    },
    update: { settingsCenterJson: existing as Prisma.InputJsonValue },
  });
}

/** Build frame inputs from current KDS-backed snapshot for LIVE CV pass. */
export async function buildLiveCvFrameInputs(workspaceId: string): Promise<CameraFrameInput[]> {
  const snapshot = await analyzeKitchenCameras(workspaceId);
  return snapshot.cameras.map((frame) => ({
    cameraId: frame.cameraId,
    stationName: frame.stationName,
    detections: frame.detections,
    queueLength: frame.queueLength,
    analyzedAt: frame.analyzedAt,
  }));
}

/** Run LIVE CV analysis — on-device frames when provided, else KDS-hydrated live tick. */
export async function runCameraLiveAnalysis(
  workspaceId: string,
  liveFrames: CameraFrameInput[] = [],
): Promise<CameraLiveDashboard> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) throw new Error(`Workspace not found: ${workspaceId}`);

  const framesInput =
    liveFrames.length > 0 ? liveFrames : await buildLiveCvFrameInputs(workspaceId);

  const [analysis, configs, history, priorEvents] = await Promise.all([
    analyzeKitchenCamerasWithFrames(workspaceId, framesInput),
    getKitchenCameras(workspaceId),
    loadKitchenCameraHistory(ownerUserId),
    loadLiveEvents(ownerUserId),
  ]);

  const now = new Date();
  const freshPoints = framesToTimelinePoints(analysis.cameras, now);
  const timeline15m = [...history.timeline, ...freshPoints]
    .filter((p) => new Date(p.at) >= subMinutes(now, 15))
    .sort((a, b) => a.at.localeCompare(b.at));

  await saveKitchenCameraHistory(ownerUserId, { timeline: timeline15m });

  const idleStations = detectIdleDowntimeStations(timeline15m, 5, now);
  const freshEvents = buildCameraLiveEvents({
    frames: analysis.cameras,
    idleStations,
    at: now,
  });
  const events = mergeEvents(priorEvents.events, freshEvents);
  await saveLiveEvents(ownerUserId, { events });

  const cameras = attachCameraConfig(analysis.cameras, configs).map((frame) => ({
    ...frame,
    live: analysis.dataSource !== "synthetic_kds",
  }));

  return {
    workspaceId,
    analyzedAt: analysis.analyzedAt,
    dataSource: analysis.dataSource,
    confidence: analysis.confidence,
    cameras,
    events,
    timeline15m,
    summary: {
      liveCameraCount: cameras.filter((c) => c.live).length,
      ppeCompliancePercent: analysis.summary.ppeCompliancePercent,
      idleStations,
      overloadedStations: analysis.summary.overloadedStations,
      openEvents: events.filter((e) => e.severity !== "info").length,
    },
    refreshSeconds: CAMERA_LIVE_REFRESH_SECONDS,
  };
}

export async function ingestCameraLiveFrame(
  workspaceId: string,
  frame: CameraFrameInput,
): Promise<CameraLiveDashboard> {
  return runCameraLiveAnalysis(workspaceId, [frame]);
}

export async function getCameraLiveDashboard(workspaceId: string): Promise<CameraLiveDashboard> {
  return runCameraLiveAnalysis(workspaceId, []);
}
