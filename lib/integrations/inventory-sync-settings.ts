export type InventoryConflictResolution =
  | "manual_review"
  | "kitchen_wins"
  | "channel_wins";

export type InventorySyncSettings = {
  enabled: boolean;
  conflictResolution: InventoryConflictResolution;
  autoPushOnPull: boolean;
};

export const DEFAULT_INVENTORY_SYNC_SETTINGS: InventorySyncSettings = {
  enabled: true,
  conflictResolution: "manual_review",
  autoPushOnPull: false,
};

export type StoredInventoryConflict = {
  id: string;
  connectionId: string;
  provider: string;
  externalProductId: string;
  externalVariantId: string;
  mappedProductId: string | null;
  productTitle: string;
  sku: string | null;
  kitchenQuantity: number;
  channelQuantity: number;
  detectedAt: string;
};

export function parseInventorySyncSettings(raw: unknown): InventorySyncSettings {
  if (!raw || typeof raw !== "object") return DEFAULT_INVENTORY_SYNC_SETTINGS;
  const o = raw as Record<string, unknown>;
  const resolution = o.conflictResolution;
  const conflictResolution: InventoryConflictResolution =
    resolution === "kitchen_wins" || resolution === "channel_wins"
      ? resolution
      : "manual_review";
  return {
    enabled: typeof o.enabled === "boolean" ? o.enabled : DEFAULT_INVENTORY_SYNC_SETTINGS.enabled,
    conflictResolution,
    autoPushOnPull:
      typeof o.autoPushOnPull === "boolean"
        ? o.autoPushOnPull
        : DEFAULT_INVENTORY_SYNC_SETTINGS.autoPushOnPull,
  };
}

export function inventorySyncSettingsFromConnection(settingsJson: unknown): InventorySyncSettings {
  if (!settingsJson || typeof settingsJson !== "object") return DEFAULT_INVENTORY_SYNC_SETTINGS;
  const inv = (settingsJson as Record<string, unknown>).inventorySync;
  return parseInventorySyncSettings(inv);
}

export function mergeInventorySyncIntoConnectionSettings(
  settingsJson: unknown,
  settings: InventorySyncSettings,
  conflicts?: StoredInventoryConflict[],
): Record<string, unknown> {
  const base =
    settingsJson && typeof settingsJson === "object"
      ? { ...(settingsJson as Record<string, unknown>) }
      : {};
  const prev =
    base.inventorySync && typeof base.inventorySync === "object"
      ? { ...(base.inventorySync as Record<string, unknown>) }
      : {};
  base.inventorySync = {
    ...prev,
    ...settings,
    ...(conflicts != null ? { conflicts } : {}),
  };
  return base;
}

export function storedConflictsFromConnection(settingsJson: unknown): StoredInventoryConflict[] {
  if (!settingsJson || typeof settingsJson !== "object") return [];
  const inv = (settingsJson as Record<string, unknown>).inventorySync;
  if (!inv || typeof inv !== "object") return [];
  const raw = (inv as Record<string, unknown>).conflicts;
  if (!Array.isArray(raw)) return [];
  return raw.filter((c): c is StoredInventoryConflict => {
    return (
      c != null &&
      typeof c === "object" &&
      typeof (c as StoredInventoryConflict).id === "string"
    );
  });
}
