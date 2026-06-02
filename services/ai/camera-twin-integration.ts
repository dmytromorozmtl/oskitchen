import type { Prisma } from "@prisma/client";

import {
  applyCameraLoadsToTwinConfig,
  buildKdsStateWithCameraLoads,
  cameraFusionConfidence,
  cameraLoadsFromFrames,
  resolveCameraStationLoads,
} from "@/lib/ai/camera-twin-builders";
import type { CameraTwinUpdate } from "@/lib/ai/camera-twin-types";
import { simulateKitchen } from "@/lib/ai/digital-twin-simulation";
import {
  buildKdsTwinPredictions,
  buildLiveSimulationParams,
  computeStationLoadsFromKdsOrders,
  shouldSendBottleneckAlert,
} from "@/lib/ai/real-time-twin-builders";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId, resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import { analyzeKitchenCameras } from "@/services/ai/kitchen-camera";
import { createDigitalTwin } from "@/services/ai/digital-twin";
import {
  getCurrentKDSState,
  getCurrentPOSOrders,
  persistKDSPredictions,
  sendTwinBottleneckAlert,
} from "@/services/ai/real-time-twin";

export type { CameraTwinUpdate, CameraStationLoad } from "@/lib/ai/camera-twin-types";

const CAMERA_TWIN_KEY = "cameraTwin";

async function persistCameraTwinSnapshot(
  ownerUserId: string,
  snapshot: { updatedAt: string; cameraLoadsApplied: CameraTwinUpdate["cameraLoadsApplied"] },
): Promise<void> {
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

  existing[CAMERA_TWIN_KEY] = snapshot;

  await prisma.kitchenSettings.upsert({
    where: { userId: ownerUserId },
    create: { userId: ownerUserId, settingsCenterJson: existing as Prisma.InputJsonValue },
    update: { settingsCenterJson: existing as Prisma.InputJsonValue },
  });
}

/**
 * Camera-Twin integration — camera queueLength → Digital Twin station.currentLoad → re-simulate → KDS predictions.
 */
export async function updateTwinWithCameraData(workspaceId: string): Promise<CameraTwinUpdate> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }

  const [cameraAnalysis, kdsState, posSnapshot, twin] = await Promise.all([
    analyzeKitchenCameras(workspaceId),
    getCurrentKDSState(workspaceId),
    getCurrentPOSOrders(workspaceId),
    createDigitalTwin(workspaceId),
  ]);

  const stationNames = twin.config.stations.map((s) => s.name);
  const kdsLoads = computeStationLoadsFromKdsOrders(kdsState.orders, stationNames);
  const cameraLoads = cameraLoadsFromFrames(cameraAnalysis.cameras);

  const cameraLoadsApplied = resolveCameraStationLoads({
    stationNames,
    cameraLoads,
    kdsLoads,
  });

  const configWithCameraLoad = applyCameraLoadsToTwinConfig(twin.config, cameraLoadsApplied);
  const fusedKdsState = buildKdsStateWithCameraLoads(kdsState, cameraLoadsApplied, stationNames);

  const simParams = buildLiveSimulationParams({ kdsState: fusedKdsState, posSnapshot });
  const simulation = simulateKitchen(configWithCameraLoad, simParams);

  const fusionConfidence = cameraFusionConfidence(cameraLoadsApplied);
  const predictions = buildKdsTwinPredictions({
    workspaceId,
    kdsState: fusedKdsState,
    simulation: {
      ...simulation,
      confidence: Math.min(0.95, (simulation.confidence + fusionConfidence) / 2),
    },
  });

  await persistKDSPredictions(ownerUserId, predictions);
  await persistCameraTwinSnapshot(ownerUserId, {
    updatedAt: predictions.updatedAt,
    cameraLoadsApplied,
  });

  let alertSent = false;
  let alertReason: string | undefined;

  if (shouldSendBottleneckAlert(simulation.bottleneckDelay)) {
    try {
      const alertOutcome = await sendTwinBottleneckAlert({
        ownerUserId,
        workspaceId,
        station: simulation.bottleneckStation,
        delayMinutes: simulation.bottleneckDelay,
        queueDepth: fusedKdsState.queueDepth,
      });
      alertSent = alertOutcome.sent;
      alertReason = alertOutcome.reason;
    } catch (error) {
      logger.warn("camera twin bottleneck alert failed", error);
      alertReason = error instanceof Error ? error.message : "Alert delivery failed.";
    }
  }

  return {
    workspaceId,
    kdsState: fusedKdsState,
    posSnapshot,
    simulation,
    predictions,
    alertSent,
    alertReason,
    cameraAnalysis,
    cameraLoadsApplied,
    fusionSource: "camera_kds",
  };
}

export async function updateTwinWithCameraDataForUser(userId: string): Promise<CameraTwinUpdate> {
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  if (!workspaceId) throw new Error(`No workspace for user: ${userId}`);
  return updateTwinWithCameraData(workspaceId);
}
