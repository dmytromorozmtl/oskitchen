import type { CameraFrameAnalysis } from "@/lib/ai/kitchen-camera-types";
import type { KitchenTwinConfig } from "@/lib/ai/digital-twin-types";
import type { KdsLiveState } from "@/lib/ai/real-time-twin-types";

import type { CameraLoadSource, CameraStationLoad } from "@/lib/ai/camera-twin-types";

export function cameraLoadsFromFrames(
  frames: Pick<CameraFrameAnalysis, "stationName" | "queueLength">[],
): Map<string, number> {
  const map = new Map<string, number>();
  for (const frame of frames) {
    map.set(frame.stationName, frame.queueLength);
  }
  return map;
}

export function resolveCameraStationLoads(input: {
  stationNames: string[];
  cameraLoads: Map<string, number>;
  kdsLoads: Map<string, number>;
}): CameraStationLoad[] {
  return input.stationNames.map((station) => {
    if (input.cameraLoads.has(station)) {
      return {
        station,
        queueLength: input.cameraLoads.get(station) ?? 0,
        source: "camera" as CameraLoadSource,
      };
    }
    return {
      station,
      queueLength: input.kdsLoads.get(station) ?? 0,
      source: "kds_fallback" as CameraLoadSource,
    };
  });
}

/** Apply camera queue lengths to Digital Twin station.currentLoad (camera wins, KDS fallback). */
export function applyCameraLoadsToTwinConfig(
  config: KitchenTwinConfig,
  loads: CameraStationLoad[],
): KitchenTwinConfig {
  const byStation = new Map(loads.map((l) => [l.station, l.queueLength]));
  return {
    ...config,
    stations: config.stations.map((station) => ({
      ...station,
      currentLoad: byStation.get(station.name) ?? station.currentLoad,
    })),
  };
}

/** Merge camera queue data into KDS live state for prediction surfaces. */
export function buildKdsStateWithCameraLoads(
  base: KdsLiveState,
  loads: CameraStationLoad[],
  stationNames: string[],
): KdsLiveState {
  const byStation = new Map(loads.map((l) => [l.station, l.queueLength]));
  const stationLoads = stationNames.map((station) => ({
    station,
    load: byStation.get(station) ?? base.stationLoads.find((s) => s.station === station)?.load ?? 0,
  }));

  const cameraTotal = loads
    .filter((l) => l.source === "camera")
    .reduce((sum, l) => sum + l.queueLength, 0);
  const fusedQueueDepth = Math.max(
    base.queueDepth,
    stationLoads.reduce((sum, s) => sum + s.load, 0),
    cameraTotal,
  );

  return {
    ...base,
    queueDepth: fusedQueueDepth,
    stationLoads,
    updatedAt: new Date().toISOString(),
  };
}

export function cameraFusionConfidence(loads: CameraStationLoad[]): number {
  if (loads.length === 0) return 0.5;
  const cameraCount = loads.filter((l) => l.source === "camera").length;
  return Math.round((0.55 + (cameraCount / loads.length) * 0.35) * 100) / 100;
}
