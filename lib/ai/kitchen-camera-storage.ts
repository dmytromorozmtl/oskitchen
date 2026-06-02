import type { Prisma } from "@prisma/client";

import type { KitchenCameraConfig, KitchenCameraStorage } from "@/lib/ai/kitchen-camera-types";
import type { KitchenCameraHistoryStorage as DashboardHistory } from "@/lib/ai/kitchen-camera-dashboard-types";
import { parseCameraHistory } from "@/lib/ai/kitchen-camera-dashboard-builders";
import { prisma } from "@/lib/prisma";

export const EMPTY_KITCHEN_CAMERA_STORAGE: KitchenCameraStorage = {
  cameras: [],
  lastAnalysisAt: null,
};

const STORAGE_KEY = "kitchenCameras";
const HISTORY_KEY = "kitchenCameraHistory";

function parseCameraConfig(raw: unknown): KitchenCameraConfig | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.cameraId !== "string" || typeof obj.stationName !== "string") return null;

  return {
    cameraId: obj.cameraId,
    label: typeof obj.label === "string" ? obj.label : obj.stationName,
    stationName: obj.stationName,
    streamUrl: typeof obj.streamUrl === "string" ? obj.streamUrl : null,
    enabled: obj.enabled !== false,
    capacityUnits:
      typeof obj.capacityUnits === "number" && obj.capacityUnits > 0 ? obj.capacityUnits : 1,
  };
}

export function parseKitchenCameraStorage(raw: unknown): KitchenCameraStorage {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...EMPTY_KITCHEN_CAMERA_STORAGE };
  }
  const obj = raw as Record<string, unknown>;
  const camerasRaw = obj.cameras;
  const cameras: KitchenCameraConfig[] = [];

  if (Array.isArray(camerasRaw)) {
    for (const entry of camerasRaw) {
      const parsed = parseCameraConfig(entry);
      if (parsed) cameras.push(parsed);
    }
  }

  return {
    cameras,
    lastAnalysisAt: typeof obj.lastAnalysisAt === "string" ? obj.lastAnalysisAt : null,
  };
}

export async function loadKitchenCameraStorage(ownerUserId: string): Promise<KitchenCameraStorage> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });
  const center = kitchen?.settingsCenterJson;
  if (!center || typeof center !== "object" || Array.isArray(center)) {
    return { ...EMPTY_KITCHEN_CAMERA_STORAGE };
  }
  return parseKitchenCameraStorage((center as Record<string, unknown>)[STORAGE_KEY]);
}

/** Alias used by kitchen-camera service. */
export async function parseKitchenCameraStorageFromUser(
  ownerUserId: string,
): Promise<KitchenCameraStorage> {
  return loadKitchenCameraStorage(ownerUserId);
}

export async function saveKitchenCameraStorage(
  ownerUserId: string,
  storage: KitchenCameraStorage,
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

  existing[STORAGE_KEY] = storage;

  await prisma.kitchenSettings.upsert({
    where: { userId: ownerUserId },
    create: { userId: ownerUserId, settingsCenterJson: existing as Prisma.InputJsonValue },
    update: { settingsCenterJson: existing as Prisma.InputJsonValue },
  });
}

export async function loadKitchenCameraHistory(ownerUserId: string): Promise<DashboardHistory> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });
  const center = kitchen?.settingsCenterJson;
  if (!center || typeof center !== "object" || Array.isArray(center)) {
    return { timeline: [] };
  }
  return parseCameraHistory((center as Record<string, unknown>)[HISTORY_KEY]);
}

export async function saveKitchenCameraHistory(
  ownerUserId: string,
  history: DashboardHistory,
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

  existing[HISTORY_KEY] = history;

  await prisma.kitchenSettings.upsert({
    where: { userId: ownerUserId },
    create: { userId: ownerUserId, settingsCenterJson: existing as Prisma.InputJsonValue },
    update: { settingsCenterJson: existing as Prisma.InputJsonValue },
  });
}
