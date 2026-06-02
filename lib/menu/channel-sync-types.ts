import type { IntegrationProvider, IntegrationStatus } from "@prisma/client";

import type { ChannelSyncStatus } from "@/lib/menu/universal-menu-types";
import type { EffectiveChannelItem, UniversalMenuMaster } from "@/lib/menu/universal-menu-types";

/** Input shared by all Universal Menu channel sync adapters. */
export type ChannelMenuSyncInput = {
  userId: string;
  productId: string;
  effective: EffectiveChannelItem;
  previousMaster: UniversalMenuMaster;
};

export type ChannelMenuSyncResult = {
  ok: boolean;
  status: ChannelSyncStatus;
  message?: string;
};

export type IntegrationConnectionSnapshot = {
  id: string | null;
  connected: boolean;
  status: IntegrationStatus | null;
  externalStoreId: string | null;
};

export function toSyncResult(
  ok: boolean,
  status: ChannelSyncStatus,
  message?: string,
): ChannelMenuSyncResult {
  return { ok, status, message };
}

export function marketplaceItemPayload(input: ChannelMenuSyncInput) {
  const externalId = input.effective.externalId ?? input.productId;
  return {
    external_id: externalId,
    name: input.effective.title,
    description: input.effective.description ?? undefined,
    price: Math.round(input.effective.price * 100),
    available: input.effective.enabled,
    active: input.effective.enabled,
  };
}
