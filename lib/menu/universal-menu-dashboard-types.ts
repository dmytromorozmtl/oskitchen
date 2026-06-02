import type { MenuChannel, UniversalMenuItem, UniversalMenuSyncHistoryEntry } from "@/lib/menu/universal-menu-types";

export const CHANNEL_LABELS: Record<MenuChannel, string> = {
  pos: "POS",
  website: "Website",
  shopify: "Shopify",
  uberEats: "Uber Eats",
  doordash: "DoorDash",
  grubhub: "Grubhub",
  kiosk: "Kiosk",
};

export type UniversalMenuDashboardPayload = {
  items: UniversalMenuItem[];
  menus: { id: string; title: string }[];
  syncHistory: Array<UniversalMenuSyncHistoryEntry & { productId: string; productTitle: string }>;
};

export type BulkMenuItemPatch = {
  priceDeltaPercent?: number;
  channel?: MenuChannel;
  channelEnabled?: boolean;
};

export type SyncAllResult = {
  synced: number;
  failed: number;
  outcomes: Array<{ productId: string; ok: boolean; message?: string }>;
};

export type ImportCsvResult = {
  imported: number;
  skipped: number;
  errors: string[];
};
