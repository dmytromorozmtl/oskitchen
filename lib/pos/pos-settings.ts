/**
 * POS workspace defaults stored in `KitchenSettings.posSettingsJson`.
 * Offline queue is enabled by default for all workspaces.
 */

export type PosConflictResolutionStrategy = "server_wins" | "manual_review";

export type PosSettings = {
  offlineQueueEnabled: boolean;
  conflictResolution: PosConflictResolutionStrategy;
};

export const DEFAULT_POS_SETTINGS: PosSettings = {
  offlineQueueEnabled: true,
  conflictResolution: "manual_review",
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function mergePosSettings(raw: unknown): PosSettings {
  if (!isPlainObject(raw)) return DEFAULT_POS_SETTINGS;
  return {
    offlineQueueEnabled: raw.offlineQueueEnabled !== false,
    conflictResolution: raw.conflictResolution === "server_wins" ? "server_wins" : "manual_review",
  };
}
