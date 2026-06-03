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
import { getUberEatsAccessToken } from "@/services/integrations/uber-eats/menu-sync.service";
import { getUberEatsCredentialsForUser } from "@/services/integrations/uber-eats/uber-eats-service";

const UBER_MENU_API =
  process.env.UBER_EATS_MENU_API_BASE ?? "https://api.uber.com/v2/eats/stores";

/** Push a single menu item to Uber Eats marketplace menu API. */
export async function syncMenuItemToUberEats(
  input: ChannelMenuSyncInput,
): Promise<ChannelMenuSyncResult> {
  const conn = await loadIntegrationConnection(input.userId, IntegrationProvider.UBER_EATS);
  if (!conn.connected) {
    return toSyncResult(
      false,
      conn.status ? "error" : "disconnected",
      connectionErrorMessage("Uber Eats", conn.status),
    );
  }

  const creds = await getUberEatsCredentialsForUser(input.userId);
  const storeId = conn.externalStoreId?.trim() || creds?.storeId?.trim();
  if (!creds?.clientId?.trim() || !creds.clientSecret?.trim() || !storeId) {
    return toSyncResult(false, "pending", "Uber Eats credentials or store ID missing.");
  }

  const externalId = input.effective.externalId ?? input.productId;
  const item = marketplaceItemPayload(input);

  const outcome = await runChannelMenuSyncJob({
    userId: input.userId,
    connectionId: conn.id,
    provider: IntegrationProvider.UBER_EATS,
    run: async () => {
      const token = await getUberEatsAccessToken(creds);
      if (!token) {
        return { ok: false, message: "Uber OAuth token unavailable — item payload staged locally." };
      }

      const url = `${UBER_MENU_API}/${encodeURIComponent(storeId)}/menus/items/${encodeURIComponent(externalId)}`;
      const patch = await patchMarketplaceMenuItem({
        url,
        headers: { Authorization: `Bearer ${token}` },
        body: {
          id: externalId,
          title: item.name,
          description: item.description,
          price: item.price,
          suspension_info: input.effective.enabled ? null : { suspension: { suspend_until: null } },
        },
      });

      return { ok: patch.ok, message: patch.message };
    },
  });

  return toSyncResult(outcome.ok, outcome.ok ? "synced" : "error", outcome.message);
}
