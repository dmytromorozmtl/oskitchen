import { outcomeFromStatus } from "@/lib/menu/universal-menu-builders";
import type { ChannelMenuSyncInput, ChannelMenuSyncResult } from "@/lib/menu/channel-sync-types";
import type { ChannelPushOutcome, MenuChannel } from "@/lib/menu/universal-menu-types";
import { syncMenuItemToDoorDash } from "@/services/menu/sync/doordash-sync";
import { syncMenuItemToGrubhub } from "@/services/menu/sync/grubhub-sync";
import { syncMenuItemToKiosk } from "@/services/menu/sync/kiosk-sync";
import { syncMenuItemToPos } from "@/services/menu/sync/pos-sync";
import { syncMenuItemToShopify } from "@/services/menu/sync/shopify-sync";
import { syncMenuItemToUberEats } from "@/services/menu/sync/uber-eats-sync";
import { syncMenuItemToWebsite } from "@/services/menu/sync/website-sync";

export type ChannelMenuSyncAdapter = (
  input: ChannelMenuSyncInput,
) => Promise<ChannelMenuSyncResult>;

export const CHANNEL_MENU_SYNC_ADAPTERS: Record<MenuChannel, ChannelMenuSyncAdapter> = {
  pos: syncMenuItemToPos,
  website: syncMenuItemToWebsite,
  kiosk: syncMenuItemToKiosk,
  shopify: syncMenuItemToShopify,
  uberEats: syncMenuItemToUberEats,
  doordash: syncMenuItemToDoorDash,
  grubhub: syncMenuItemToGrubhub,
};

export function syncResultToPushOutcome(
  channel: MenuChannel,
  result: ChannelMenuSyncResult,
): ChannelPushOutcome {
  return outcomeFromStatus(channel, result.status, result.message);
}

export async function runChannelMenuSync(
  channel: MenuChannel,
  input: ChannelMenuSyncInput,
): Promise<ChannelPushOutcome> {
  const adapter = CHANNEL_MENU_SYNC_ADAPTERS[channel];
  const result = await adapter(input);
  return syncResultToPushOutcome(channel, result);
}

export {
  syncMenuItemToPos,
  syncMenuItemToWebsite,
  syncMenuItemToKiosk,
  syncMenuItemToShopify,
  syncMenuItemToUberEats,
  syncMenuItemToDoorDash,
  syncMenuItemToGrubhub,
};
