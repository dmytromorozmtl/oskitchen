import { IntegrationProvider } from "@prisma/client";

import {
  connectionErrorMessage,
  loadIntegrationConnection,
  patchMarketplaceMenuItem,
  runChannelMenuSyncJob,
} from "@/lib/menu/channel-sync-helpers";
import {
  marketplaceItemPayload,
  toSyncResult,
  type ChannelMenuSyncInput,
  type ChannelMenuSyncResult,
} from "@/lib/menu/channel-sync-types";
import type { DoorDashCredentials } from "@/services/integrations/doordash/doordash-service";

const MENU_API_BASE =
  process.env.DOORDASH_MENU_API_BASE ?? "https://openapi.doordash.com/marketplace/v2";

function credsFromEnv(): DoorDashCredentials {
  return {
    apiKey: process.env.DOORDASH_API_KEY ?? null,
    merchantId: process.env.DOORDASH_MERCHANT_ID ?? null,
  };
}

/** Push a single menu item to DoorDash marketplace menu API. */
export async function syncMenuItemToDoorDash(
  input: ChannelMenuSyncInput,
): Promise<ChannelMenuSyncResult> {
  const conn = await loadIntegrationConnection(input.userId, IntegrationProvider.DOORDASH);
  if (!conn.connected) {
    return toSyncResult(
      false,
      conn.status ? "error" : "disconnected",
      connectionErrorMessage("DoorDash", conn.status),
    );
  }

  const env = credsFromEnv();
  const merchantId = conn.externalStoreId?.trim() || env.merchantId?.trim();
  const apiKey = env.apiKey?.trim();

  if (!apiKey || !merchantId) {
    return toSyncResult(false, "pending", "DoorDash API key and merchant ID required.");
  }

  if (!input.effective.enabled && !input.effective.externalId) {
    return toSyncResult(true, "synced", "DoorDash item disabled locally — no external link.");
  }

  const externalId = input.effective.externalId ?? input.productId;
  const item = marketplaceItemPayload(input);

  const outcome = await runChannelMenuSyncJob({
    userId: input.userId,
    connectionId: conn.id,
    provider: IntegrationProvider.DOORDASH,
    run: async () => {
      const url = `${MENU_API_BASE}/stores/${encodeURIComponent(merchantId)}/menu/items/${encodeURIComponent(externalId)}`;
      const patch = await patchMarketplaceMenuItem({
        url,
        headers: { Authorization: `Bearer ${apiKey}` },
        body: { item },
      });
      return { ok: patch.ok, message: patch.message };
    },
  });

  if (!input.effective.externalId && !outcome.ok) {
    return toSyncResult(false, "pending", "Set externalId or import DoorDash menu mapping.");
  }

  return toSyncResult(outcome.ok, outcome.ok ? "synced" : "error", outcome.message);
}
