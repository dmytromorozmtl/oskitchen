import { getSkipCredentialsForUser } from "@/services/integrations/skip/skip-credentials";
import { importSkipOrdersForUser } from "@/services/integrations/skip/order-import.service";

export type SkipCapabilitySnapshot = {
  hasCredentials: boolean;
  liveImportReady: boolean;
  liveStatusReady: boolean;
  placeholderMode: boolean;
};

export function getSkipCapabilitySnapshot(
  env: NodeJS.ProcessEnv = process.env,
): SkipCapabilitySnapshot {
  const hasCredentials = Boolean(
    env.SKIP_CLIENT_ID?.trim() &&
      env.SKIP_CLIENT_SECRET?.trim() &&
      env.SKIP_RESTAURANT_ID?.trim(),
  );
  return {
    hasCredentials,
    liveImportReady: hasCredentials,
    liveStatusReady: hasCredentials,
    placeholderMode: !hasCredentials,
  };
}

export function getSkipLiveMessage(
  hasCredentials = getSkipCapabilitySnapshot().hasCredentials,
): string {
  return hasCredentials
    ? "Skip / Just Eat LIVE is enabled. Webhooks import to KDS and status updates push back to Skip."
    : "Configure SKIP_CLIENT_ID, SKIP_CLIENT_SECRET, and SKIP_RESTAURANT_ID for LIVE order ingest.";
}

export async function fetchSkipOrders(userId: string) {
  const capability = getSkipCapabilitySnapshot();
  if (capability.placeholderMode) {
    throw new Error(`Skip order import disabled: ${getSkipLiveMessage(false)}`);
  }
  return importSkipOrdersForUser(userId);
}

export async function testSkipConnection(userId: string) {
  const creds = await getSkipCredentialsForUser(userId);
  if (!creds?.clientId?.trim() || !creds.clientSecret?.trim()) {
    return { ok: false as const, message: getSkipLiveMessage(false) };
  }
  const tokenUrl = process.env.SKIP_TOKEN_URL ?? "https://api-partner.skip.com/oauth/token";
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: creds.clientId.trim(),
    client_secret: creds.clientSecret.trim(),
    scope: "orders.read",
  });
  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  return {
    ok: res.ok,
    message: res.ok
      ? "OAuth token exchange succeeded (LIVE). Confirm restaurant ID and webhook signing."
      : `OAuth token exchange failed (${res.status}).`,
  };
}
