import { subMinutes } from "date-fns";

import type {
  CameraAlert,
  CameraHeatmapCell,
  CameraTimelinePoint,
  KitchenCameraHistoryStorage,
} from "@/lib/ai/kitchen-camera-dashboard-types";
import type {
  ActivityLevel,
  CameraFrameAnalysis,
  KitchenCameraConfig,
} from "@/lib/ai/kitchen-camera-types";

const THIRTY_MIN_MS = 30 * 60 * 1000;

export const ACTIVITY_SCORE: Record<ActivityLevel, number> = {
  idle: 12,
  normal: 42,
  busy: 72,
  overloaded: 95,
};

export const ACTIVITY_CLASS: Record<ActivityLevel, string> = {
  idle: "bg-zinc-500/20 text-zinc-600 border-zinc-500/30",
  normal: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  busy: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  overloaded: "bg-red-500/15 text-red-700 border-red-500/30",
};

export const EQUIPMENT_CLASS: Record<string, string> = {
  offline: "text-zinc-500",
  idle: "text-zinc-600",
  running: "text-emerald-600",
  warning: "text-amber-600",
  error: "text-red-600",
};

function slugId(type: string, key: string): string {
  return `${type}-${key.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`;
}

export function buildCameraAlerts(frames: CameraFrameAnalysis[], at = new Date()): CameraAlert[] {
  const alerts: CameraAlert[] = [];
  const iso = at.toISOString();

  for (const frame of frames) {
    if (frame.ppe.status === "violation") {
      alerts.push({
        id: slugId("ppe", frame.cameraId),
        type: "ppe_violation",
        severity: "critical",
        stationName: frame.stationName,
        cameraId: frame.cameraId,
        message: `PPE violation at ${frame.stationName}: ${frame.ppe.violations.join(", ").replace(/_/g, " ")}`,
        at: iso,
      });
    } else if (frame.ppe.status === "partial") {
      alerts.push({
        id: slugId("ppe-partial", frame.cameraId),
        type: "ppe_partial",
        severity: "warning",
        stationName: frame.stationName,
        cameraId: frame.cameraId,
        message: `Partial PPE compliance at ${frame.stationName}`,
        at: iso,
      });
    }

    if (frame.equipmentStatus === "error") {
      alerts.push({
        id: slugId("eq-err", frame.cameraId),
        type: "equipment_error",
        severity: "critical",
        stationName: frame.stationName,
        cameraId: frame.cameraId,
        message: `Equipment error detected at ${frame.stationName}`,
        at: iso,
      });
    } else if (frame.equipmentStatus === "warning") {
      alerts.push({
        id: slugId("eq-warn", frame.cameraId),
        type: "equipment_warning",
        severity: "warning",
        stationName: frame.stationName,
        cameraId: frame.cameraId,
        message: `Equipment stress at ${frame.stationName} — check grill/fryer load`,
        at: iso,
      });
    }

    if (frame.activityLevel === "overloaded") {
      alerts.push({
        id: slugId("overload", frame.cameraId),
        type: "overloaded",
        severity: "warning",
        stationName: frame.stationName,
        cameraId: frame.cameraId,
        message: `${frame.stationName} overloaded — queue ${frame.queueLength}, ${frame.staffCount} staff visible`,
        at: iso,
      });
    }
  }

  const rank = { critical: 0, warning: 1, info: 2 };
  return alerts.sort((a, b) => rank[a.severity] - rank[b.severity]);
}

export function framesToTimelinePoints(
  frames: CameraFrameAnalysis[],
  at = new Date(),
): CameraTimelinePoint[] {
  const iso = at.toISOString();
  return frames.map((f) => ({
    at: iso,
    cameraId: f.cameraId,
    stationName: f.stationName,
    queueLength: f.queueLength,
    activityLevel: f.activityLevel,
    staffCount: f.staffCount,
  }));
}

export function mergeTimelineHistory(
  history: CameraTimelinePoint[],
  fresh: CameraTimelinePoint[],
  now = new Date(),
): CameraTimelinePoint[] {
  const cutoff = now.getTime() - THIRTY_MIN_MS;
  const merged = [...history, ...fresh].filter((p) => new Date(p.at).getTime() >= cutoff);
  merged.sort((a, b) => a.at.localeCompare(b.at));
  return merged.slice(-500);
}

export function parseCameraHistory(raw: unknown): KitchenCameraHistoryStorage {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { timeline: [] };
  }
  const obj = raw as Record<string, unknown>;
  if (!Array.isArray(obj.timeline)) return { timeline: [] };

  const timeline: CameraTimelinePoint[] = [];
  for (const entry of obj.timeline) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
    const e = entry as Record<string, unknown>;
    if (typeof e.at !== "string" || typeof e.cameraId !== "string") continue;
    timeline.push({
      at: e.at,
      cameraId: e.cameraId,
      stationName: typeof e.stationName === "string" ? e.stationName : "Station",
      queueLength: Number(e.queueLength) || 0,
      activityLevel:
        e.activityLevel === "idle" ||
        e.activityLevel === "normal" ||
        e.activityLevel === "busy" ||
        e.activityLevel === "overloaded"
          ? e.activityLevel
          : "normal",
      staffCount: Number(e.staffCount) || 0,
    });
  }
  return { timeline };
}

export function buildSyntheticTimeline30m(
  frames: CameraFrameAnalysis[],
  now = new Date(),
): CameraTimelinePoint[] {
  if (frames.length === 0) return [];

  const points: CameraTimelinePoint[] = [];
  const steps = [25, 20, 15, 10, 5, 0];

  for (const frame of frames) {
    for (const minsAgo of steps) {
      const t = subMinutes(now, minsAgo);
      const factor = 1 - minsAgo / 30;
      const queue = Math.max(0, Math.round(frame.queueLength * factor * (0.85 + (minsAgo % 3) * 0.05)));
      let activity: ActivityLevel = "idle";
      if (queue >= frame.queueLength && frame.activityLevel === "overloaded") activity = minsAgo < 10 ? "overloaded" : "busy";
      else if (queue >= 2) activity = minsAgo < 15 ? frame.activityLevel : "normal";
      else if (queue === 1) activity = "normal";
      else activity = minsAgo > 20 ? "idle" : "normal";

      points.push({
        at: t.toISOString(),
        cameraId: frame.cameraId,
        stationName: frame.stationName,
        queueLength: queue,
        activityLevel: activity,
        staffCount: Math.max(0, frame.staffCount - (minsAgo > 15 ? 1 : 0)),
      });
    }
  }

  return points.sort((a, b) => a.at.localeCompare(b.at));
}

export function buildActivityHeatmap(
  timeline: CameraTimelinePoint[],
  now = new Date(),
): CameraHeatmapCell[] {
  const currentHour = now.getHours();
  const buckets = new Map<number, { sum: number; count: number }>();

  for (const point of timeline) {
    const hour = new Date(point.at).getHours();
    const bucket = buckets.get(hour) ?? { sum: 0, count: 0 };
    bucket.sum += ACTIVITY_SCORE[point.activityLevel];
    bucket.count += 1;
    buckets.set(hour, bucket);
  }

  // Fill 8 kitchen hours centered on current hour
  const cells: CameraHeatmapCell[] = [];
  for (let offset = -7; offset <= 0; offset++) {
    const hour = (currentHour + offset + 24) % 24;
    const bucket = buckets.get(hour);
    const label = `${hour.toString().padStart(2, "0")}:00`;
    cells.push({
      hour,
      label,
      activityScore: bucket && bucket.count > 0 ? Math.round(bucket.sum / bucket.count) : 8,
      samples: bucket?.count ?? 0,
    });
  }

  return cells;
}

export function attachCameraConfig(
  frames: CameraFrameAnalysis[],
  configs: KitchenCameraConfig[],
) {
  const byId = new Map(configs.map((c) => [c.cameraId, c]));
  return frames.map((frame) => {
    const config = byId.get(frame.cameraId) ?? {
      cameraId: frame.cameraId,
      label: `${frame.stationName} cam`,
      stationName: frame.stationName,
      streamUrl: null,
      enabled: true,
      capacityUnits: 1,
    };
    return { ...frame, config };
  });
}

export function heatmapTone(score: number): "green" | "yellow" | "red" {
  if (score >= 70) return "red";
  if (score >= 40) return "yellow";
  return "green";
}

export const HEATMAP_TONE_CLASS = {
  green: "bg-emerald-500/70",
  yellow: "bg-amber-500/70",
  red: "bg-red-500/70",
};
