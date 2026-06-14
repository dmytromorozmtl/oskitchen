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
import type { GrubhubCredentials } from "@/services/integrations/grubhub/grubhub-service";

const MENU_API_BASE =
  process.env.GRUBHUB_MENU_API_BASE ?? "https://api-gtm.grubhub.com/v1";

function credsFromEnv(): GrubhubCredentials {
  return {
    apiKey: process.env.GRUBHUB_API_KEY ?? null,
    merchantId: process.env.GRUBHUB_MERCHANT_ID ?? null,
  };
}

/** Push a single menu item to Grubhub marketplace menu API. */
export async function syncMenuItemToGrubhub(
  input: ChannelMenuSyncInput,
): Promise<ChannelMenuSyncResult> {
  const conn = await loadIntegrationConnection(input.userId, IntegrationProvider.GRUBHUB);
  if (!conn.connected) {
    return toSyncResult(
      false,
      conn.status ? "error" : "disconnected",
      connectionErrorMessage("Grubhub", conn.status),
    );
  }

  const env = credsFromEnv();
  const merchantId = conn.externalStoreId?.trim() || env.merchantId?.trim();
  const apiKey = env.apiKey?.trim();

  if (!apiKey || !merchantId) {
    return toSyncResult(false, "pending", "Grubhub API key and merchant ID required.");
  }

  const externalId = input.effective.externalId ?? input.productId;
  const item = marketplaceItemPayload(input);

  const outcome = await runChannelMenuSyncJob({
    userId: input.userId,
    connectionId: conn.id,
    provider: IntegrationProvider.GRUBHUB,
    run: async () => {
      const url = `${MENU_API_BASE}/merchants/${encodeURIComponent(merchantId)}/menu/items/${encodeURIComponent(externalId)}`;
      const patch = await patchMarketplaceMenuItem({
        url,
        headers: { Authorization: `Bearer ${apiKey}` },
        body: { item },
      });
      return { ok: patch.ok, message: patch.message };
    },
  });

  if (!input.effective.externalId && !outcome.ok) {
    return toSyncResult(false, "pending", "Set externalId or import Grubhub menu mapping.");
  }

  return toSyncResult(outcome.ok, outcome.ok ? "synced" : "error", outcome.message);
}
