/** Universal Menu Engine — master menu item with per-channel overrides and sync state. */

export const MENU_CHANNELS = [
  "pos",
  "website",
  "shopify",
  "uberEats",
  "doordash",
  "grubhub",
  "kiosk",
] as const;

export type MenuChannel = (typeof MENU_CHANNELS)[number];

export type ChannelSyncStatus = "synced" | "pending" | "error" | "disconnected" | "skipped";

export type ChannelItemOverride = {
  enabled?: boolean;
  title?: string;
  description?: string | null;
  price?: number;
  image?: string | null;
  category?: string;
  /** External SKU / menu item id on the delivery or commerce channel. */
  externalId?: string | null;
};

export type ChannelSyncRecord = {
  status: ChannelSyncStatus;
  lastSyncedAt: string | null;
  lastError: string | null;
};

export type UniversalMenuMaster = {
  title: string;
  description: string | null;
  price: number;
  category: string;
  image: string | null;
  active: boolean;
  posVisible: boolean;
  storefrontVisible: boolean;
};

export type UniversalMenuItem = {
  productId: string;
  menuId: string;
  master: UniversalMenuMaster;
  channelOverrides: Record<MenuChannel, ChannelItemOverride>;
  syncStatus: Record<MenuChannel, ChannelSyncRecord>;
  updatedAt: string;
};

export type EffectiveChannelItem = {
  channel: MenuChannel;
  enabled: boolean;
  title: string;
  description: string | null;
  price: number;
  image: string | null;
  category: string;
  externalId: string | null;
};

export type UniversalMenuItemUpdate = {
  master?: Partial<Pick<UniversalMenuMaster, "title" | "description" | "price" | "category" | "image" | "active">>;
  channelOverrides?: Partial<Record<MenuChannel, ChannelItemOverride>>;
  /** When true (default), push to all enabled channels after save. */
  pushToChannels?: boolean;
};

export type ChannelPushOutcome = {
  channel: MenuChannel;
  status: ChannelSyncStatus;
  message?: string;
};

export type UniversalMenuUpdateResult = {
  item: UniversalMenuItem;
  pushOutcomes: ChannelPushOutcome[];
};

export type StoredUniversalMenuItem = {
  channelOverrides: Partial<Record<MenuChannel, ChannelItemOverride>>;
  syncStatus: Partial<Record<MenuChannel, ChannelSyncRecord>>;
  syncHistory?: UniversalMenuSyncHistoryEntry[];
};

export type UniversalMenuSyncHistoryEntry = {
  at: string;
  channel: MenuChannel;
  status: ChannelSyncStatus;
  message?: string;
};

export type UniversalMenuStorage = {
  items: Record<string, StoredUniversalMenuItem>;
};
