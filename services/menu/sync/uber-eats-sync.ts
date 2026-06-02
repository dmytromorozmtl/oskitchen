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
import { getUberEatsCredentialsForUser } from "@/services/integrations/uber-eats/uber-eats-service";

const UBER_MENU_API =
  process.env.UBER_EATS_MENU_API_BASE ?? "https://api.uber.com/v2/eats/stores";

async function getUberAccessToken(clientId: string, clientSecret: string): Promise<string | null> {
  const tokenUrl = process.env.UBER_EATS_TOKEN_URL ?? "https://login.uber.com/oauth/v2/token";
  try {
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
      scope: "eats.store",
    });
    const res = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { access_token?: string };
    return json.access_token ?? null;
  } catch {
    return null;
  }
}

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
      const token = await getUberAccessToken(creds.clientId!.trim(), creds.clientSecret!.trim());
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
