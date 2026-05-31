import type { InventoryConflictResolution } from "@/lib/integrations/inventory-sync-settings";

export const CROSS_CHANNEL_INVENTORY_POLICY_ID =
  "critical-cross-channel-inventory-sync-v1" as const;

export const CROSS_CHANNEL_INVENTORY_PROVIDERS = [
  "POS",
  "SHOPIFY",
  "WOOCOMMERCE",
  "DOORDASH",
] as const;

export type CrossChannelInventoryProvider =
  (typeof CROSS_CHANNEL_INVENTORY_PROVIDERS)[number];

export type CrossChannelInventorySettings = {
  enabled: boolean;
  conflictResolution: InventoryConflictResolution;
  autoPushOnChange: boolean;
  lowStockThreshold: number;
  /** ISO timestamp of last successful pull/push for this connection. */
  lastSyncedAtIso?: string | null;
  /** Email operator when new inventory conflicts appear. */
  notifyOnConflict?: boolean;
  /** Include this workspace in daily reconciliation digest. */
  dailyReconciliationEmail?: boolean;
  /** Override recipient; defaults to workspace owner email. */
  notificationEmail?: string | null;
  /** Conflict ids already emailed — prevents duplicate alerts. */
  lastNotifiedConflictIds?: string[];
};

export const DEFAULT_CROSS_CHANNEL_INVENTORY_SETTINGS: CrossChannelInventorySettings = {
  enabled: true,
  conflictResolution: "manual_review",
  autoPushOnChange: true,
  lowStockThreshold: 5,
  lastSyncedAtIso: null,
  notifyOnConflict: true,
  dailyReconciliationEmail: true,
  notificationEmail: null,
  lastNotifiedConflictIds: [],
};

export type StoredCrossChannelReservation = {
  id: string;
  productId: string;
  quantity: number;
  channel: CrossChannelInventoryProvider;
  orderId: string | null;
  expiresAt: string;
  createdAt: string;
};

export function parseCrossChannelInventorySettings(raw: unknown): CrossChannelInventorySettings {
  if (!raw || typeof raw !== "object") return DEFAULT_CROSS_CHANNEL_INVENTORY_SETTINGS;
  const o = raw as Record<string, unknown>;
  const resolution = o.conflictResolution;
  const conflictResolution: InventoryConflictResolution =
    resolution === "kitchen_wins" || resolution === "channel_wins"
      ? resolution
      : "manual_review";
  const lastNotified = o.lastNotifiedConflictIds;
  return {
    enabled: typeof o.enabled === "boolean" ? o.enabled : DEFAULT_CROSS_CHANNEL_INVENTORY_SETTINGS.enabled,
    conflictResolution,
    autoPushOnChange:
      typeof o.autoPushOnChange === "boolean"
        ? o.autoPushOnChange
        : DEFAULT_CROSS_CHANNEL_INVENTORY_SETTINGS.autoPushOnChange,
    lowStockThreshold:
      typeof o.lowStockThreshold === "number" && o.lowStockThreshold >= 0
        ? o.lowStockThreshold
        : DEFAULT_CROSS_CHANNEL_INVENTORY_SETTINGS.lowStockThreshold,
    lastSyncedAtIso:
      typeof o.lastSyncedAtIso === "string" ? o.lastSyncedAtIso : null,
    notifyOnConflict:
      typeof o.notifyOnConflict === "boolean"
        ? o.notifyOnConflict
        : DEFAULT_CROSS_CHANNEL_INVENTORY_SETTINGS.notifyOnConflict,
    dailyReconciliationEmail:
      typeof o.dailyReconciliationEmail === "boolean"
        ? o.dailyReconciliationEmail
        : DEFAULT_CROSS_CHANNEL_INVENTORY_SETTINGS.dailyReconciliationEmail,
    notificationEmail:
      typeof o.notificationEmail === "string" ? o.notificationEmail : null,
    lastNotifiedConflictIds: Array.isArray(lastNotified)
      ? lastNotified.filter((id): id is string => typeof id === "string")
      : [],
  };
}

export function crossChannelSettingsFromConnection(settingsJson: unknown): CrossChannelInventorySettings {
  if (!settingsJson || typeof settingsJson !== "object") {
    return DEFAULT_CROSS_CHANNEL_INVENTORY_SETTINGS;
  }
  const cc = (settingsJson as Record<string, unknown>).crossChannelInventory;
  return parseCrossChannelInventorySettings(cc);
}

export function storedReservationsFromConnection(
  settingsJson: unknown,
): StoredCrossChannelReservation[] {
  if (!settingsJson || typeof settingsJson !== "object") return [];
  const cc = (settingsJson as Record<string, unknown>).crossChannelInventory;
  if (!cc || typeof cc !== "object") return [];
  const raw = (cc as Record<string, unknown>).reservations;
  if (!Array.isArray(raw)) return [];
  return raw.filter((r): r is StoredCrossChannelReservation => {
    return r != null && typeof r === "object" && typeof (r as StoredCrossChannelReservation).id === "string";
  });
}

export function mergeCrossChannelIntoConnectionSettings(
  settingsJson: unknown,
  settings: CrossChannelInventorySettings,
  reservations?: StoredCrossChannelReservation[],
): Record<string, unknown> {
  const base =
    settingsJson && typeof settingsJson === "object"
      ? { ...(settingsJson as Record<string, unknown>) }
      : {};
  const prev =
    base.crossChannelInventory && typeof base.crossChannelInventory === "object"
      ? { ...(base.crossChannelInventory as Record<string, unknown>) }
      : {};
  base.crossChannelInventory = {
    ...prev,
    ...settings,
    ...(reservations != null ? { reservations } : {}),
  };
  return base;
}
