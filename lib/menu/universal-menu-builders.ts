import {
  MENU_CHANNELS,
  type ChannelItemOverride,
  type ChannelPushOutcome,
  type ChannelSyncRecord,
  type ChannelSyncStatus,
  type EffectiveChannelItem,
  type MenuChannel,
  type UniversalMenuItem,
  type UniversalMenuMaster,
  type UniversalMenuStorage,
  type StoredUniversalMenuItem,
} from "@/lib/menu/universal-menu-types";

export const DEFAULT_CHANNEL_SYNC: ChannelSyncRecord = {
  status: "pending",
  lastSyncedAt: null,
  lastError: null,
};

export function emptyChannelOverrides(): Record<MenuChannel, ChannelItemOverride> {
  return Object.fromEntries(MENU_CHANNELS.map((c) => [c, {}])) as Record<
    MenuChannel,
    ChannelItemOverride
  >;
}

export function emptySyncStatus(): Record<MenuChannel, ChannelSyncRecord> {
  return Object.fromEntries(MENU_CHANNELS.map((c) => [c, { ...DEFAULT_CHANNEL_SYNC }])) as Record<
    MenuChannel,
    ChannelSyncRecord
  >;
}

export function mergeChannelOverrides(
  base: Partial<Record<MenuChannel, ChannelItemOverride>>,
  patch: Partial<Record<MenuChannel, ChannelItemOverride>>,
): Record<MenuChannel, ChannelItemOverride> {
  const merged = emptyChannelOverrides();
  for (const channel of MENU_CHANNELS) {
    merged[channel] = { ...(base[channel] ?? {}), ...(patch[channel] ?? {}) };
  }
  return merged;
}

export function mergeSyncStatus(
  base: Partial<Record<MenuChannel, ChannelSyncRecord>>,
  patch: Partial<Record<MenuChannel, ChannelSyncRecord>>,
): Record<MenuChannel, ChannelSyncRecord> {
  const merged = emptySyncStatus();
  for (const channel of MENU_CHANNELS) {
    merged[channel] = { ...DEFAULT_CHANNEL_SYNC, ...(base[channel] ?? {}), ...(patch[channel] ?? {}) };
  }
  return merged;
}

function channelDefaultEnabled(channel: MenuChannel, master: UniversalMenuMaster): boolean {
  switch (channel) {
    case "pos":
      return master.active && master.posVisible;
    case "website":
      return master.active && master.storefrontVisible;
    case "kiosk":
      return master.active && master.posVisible;
    default:
      return master.active;
  }
}

export function resolveEffectiveChannelItem(
  master: UniversalMenuMaster,
  channel: MenuChannel,
  override: ChannelItemOverride = {},
): EffectiveChannelItem {
  const enabled =
    override.enabled !== undefined ? override.enabled : channelDefaultEnabled(channel, master);

  return {
    channel,
    enabled,
    title: override.title?.trim() || master.title,
    description:
      override.description !== undefined ? override.description : master.description,
    price: override.price ?? master.price,
    image: override.image !== undefined ? override.image : master.image,
    category: override.category?.trim() || master.category,
    externalId: override.externalId ?? null,
  };
}

export function buildUniversalMenuItem(input: {
  productId: string;
  menuId: string;
  master: UniversalMenuMaster;
  stored?: StoredUniversalMenuItem | null;
  updatedAt?: string;
}): UniversalMenuItem {
  const overrides = mergeChannelOverrides({}, input.stored?.channelOverrides ?? {});
  const syncStatus = mergeSyncStatus({}, input.stored?.syncStatus ?? {});

  return {
    productId: input.productId,
    menuId: input.menuId,
    master: input.master,
    channelOverrides: overrides,
    syncStatus,
    updatedAt: input.updatedAt ?? new Date().toISOString(),
  };
}

export function applyPushOutcomesToSyncStatus(
  current: Record<MenuChannel, ChannelSyncRecord>,
  outcomes: ChannelPushOutcome[],
): Record<MenuChannel, ChannelSyncRecord> {
  const next = { ...current };
  const now = new Date().toISOString();

  for (const outcome of outcomes) {
    next[outcome.channel] = {
      status: outcome.status,
      lastSyncedAt: outcome.status === "synced" ? now : current[outcome.channel]?.lastSyncedAt ?? null,
      lastError:
        outcome.status === "error" || outcome.status === "disconnected"
          ? outcome.message ?? "Sync failed"
          : null,
    };
  }

  return next;
}

export function parseUniversalMenuStorage(raw: unknown): UniversalMenuStorage {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { items: {} };
  }
  const o = raw as Record<string, unknown>;
  const itemsRaw = o.items;
  if (!itemsRaw || typeof itemsRaw !== "object" || Array.isArray(itemsRaw)) {
    return { items: {} };
  }

  const items: UniversalMenuStorage["items"] = {};
  for (const [productId, value] of Object.entries(itemsRaw)) {
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;
    const row = value as Record<string, unknown>;
    items[productId] = {
      channelOverrides: (row.channelOverrides as StoredUniversalMenuItem["channelOverrides"]) ?? {},
      syncStatus: (row.syncStatus as StoredUniversalMenuItem["syncStatus"]) ?? {},
      syncHistory: Array.isArray(row.syncHistory)
        ? (row.syncHistory as StoredUniversalMenuItem["syncHistory"])
        : [],
    };
  }

  return { items };
}

export function summarizeSyncHealth(
  syncStatus: Record<MenuChannel, ChannelSyncRecord>,
): "green" | "yellow" | "red" {
  const statuses = MENU_CHANNELS.map((c) => syncStatus[c]?.status ?? "pending");
  if (statuses.some((s) => s === "error")) return "red";
  if (statuses.some((s) => s === "pending" || s === "disconnected")) return "yellow";
  return "green";
}

export function integrationProviderForChannel(channel: MenuChannel): string | null {
  switch (channel) {
    case "shopify":
      return "SHOPIFY";
    case "uberEats":
      return "UBER_EATS";
    case "doordash":
      return "DOORDASH";
    case "grubhub":
      return "GRUBHUB";
    default:
      return null;
  }
}

export function isExternalMenuChannel(channel: MenuChannel): boolean {
  return integrationProviderForChannel(channel) !== null;
}

export function outcomeFromStatus(
  channel: MenuChannel,
  status: ChannelSyncStatus,
  message?: string,
): ChannelPushOutcome {
  return { channel, status, message };
}
