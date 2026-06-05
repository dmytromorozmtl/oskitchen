import { createHmac, timingSafeEqual } from "crypto";

import { IntegrationProvider, IntegrationStatus } from "@prisma/client";

import { SITE_URL } from "@/lib/constants";
import { encryptOptional } from "@/lib/crypto";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { getSkipCredentialsForUser } from "@/services/integrations/skip/skip-credentials";
import {
  getSkipCapabilitySnapshot,
  getSkipLiveMessage,
  testSkipConnection,
} from "@/services/integrations/skip/skip-service";
import { importSkipOrdersForUser } from "@/services/integrations/skip/order-import.service";
import { normalizeSkipOrder, verifySkipWebhookSignature } from "@/services/integrations/skip/skip-marketplace";

export { verifySkipWebhookSignature };

const OAUTH_AUTHORIZE_URL =
  process.env.SKIP_OAUTH_AUTHORIZE_URL ?? "https://api-partner.skip.com/oauth/authorize";
const OAUTH_TOKEN_URL =
  process.env.SKIP_TOKEN_URL ?? "https://api-partner.skip.com/oauth/token";
const OAUTH_SCOPES = process.env.SKIP_OAUTH_SCOPES ?? "orders.read orders.write";

function oauthRedirectUri(): string {
  return (
    process.env.SKIP_OAUTH_REDIRECT_URI?.trim() ??
    `${SITE_URL}/api/integrations/skip/oauth/callback`
  );
}

function stateSecret(): string {
  return (
    process.env.SKIP_OAUTH_STATE_SECRET?.trim() ??
    process.env.ENCRYPTION_KEY?.trim() ??
    "skip-live-state-dev"
  );
}

export function signSkipOAuthState(payload: { userId: string; connectionId: string }): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", stateSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifySkipOAuthState(
  state: string,
): { userId: string; connectionId: string } | null {
  const [body, sig] = state.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", stateSecret()).update(body).digest("base64url");
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      userId?: string;
      connectionId?: string;
    };
    if (!parsed.userId || !parsed.connectionId) return null;
    return { userId: parsed.userId, connectionId: parsed.connectionId };
  } catch {
    return null;
  }
}

export async function ensureSkipConnection(userId: string) {
  const where = await integrationConnectionByProviderWhereForOwner(
    userId,
    IntegrationProvider.SKIP,
  );
  const existing = await prisma.integrationConnection.findFirst({ where });
  if (existing) return existing;
  return prisma.integrationConnection.create({
    data: {
      userId,
      provider: IntegrationProvider.SKIP,
      name: "Skip / Just Eat",
      status: IntegrationStatus.NEEDS_AUTH,
    },
  });
}

export function buildSkipOAuthAuthorizeUrl(input: {
  userId: string;
  connectionId: string;
}): string | null {
  const clientId = process.env.SKIP_CLIENT_ID?.trim();
  if (!clientId) return null;

  const state = signSkipOAuthState(input);
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: oauthRedirectUri(),
    scope: OAUTH_SCOPES,
    state,
  });
  return `${OAUTH_AUTHORIZE_URL}?${params.toString()}`;
}

export async function completeSkipOAuth(input: {
  userId: string;
  connectionId: string;
  code: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const conn = await prisma.integrationConnection.findFirst({
    where: {
      id: input.connectionId,
      userId: input.userId,
      provider: IntegrationProvider.SKIP,
    },
  });
  if (!conn) return { ok: false, error: "Connection not found." };

  const clientId = process.env.SKIP_CLIENT_ID?.trim();
  const clientSecret = process.env.SKIP_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return { ok: false, error: "Configure SKIP_CLIENT_ID and SKIP_CLIENT_SECRET before OAuth." };
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    redirect_uri: oauthRedirectUri(),
    code: input.code.trim(),
  });

  const res = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return {
      ok: false,
      error: `OAuth token exchange failed (${res.status})${text ? `: ${text.slice(0, 120)}` : ""}`,
    };
  }

  const json = (await res.json()) as { access_token?: string; refresh_token?: string };
  if (!json.access_token) {
    return { ok: false, error: "Skip OAuth response missing access_token." };
  }

  await prisma.integrationConnection.update({
    where: { id: conn.id },
    data: {
      consumerKeyEncrypted: encryptOptional(json.access_token),
      consumerSecretEncrypted: json.refresh_token
        ? encryptOptional(json.refresh_token)
        : conn.consumerSecretEncrypted,
      status: IntegrationStatus.CONNECTED,
      lastError: null,
    },
  });

  return { ok: true };
}

export async function getSkipLiveDashboard(userId: string) {
  const capability = getSkipCapabilitySnapshot();
  const where = await integrationConnectionByProviderWhereForOwner(
    userId,
    IntegrationProvider.SKIP,
  );
  const conn = await prisma.integrationConnection.findFirst({ where });
  const mode = capability.hasCredentials ? "live" : "placeholder";
  const webhookUrl = conn
    ? `${SITE_URL}/api/webhooks/skip/orders?cid=${conn.id}`
    : null;
  const authorizeUrl =
    conn && process.env.SKIP_CLIENT_ID?.trim()
      ? buildSkipOAuthAuthorizeUrl({ userId, connectionId: conn.id })
      : null;

  return {
    connectionId: conn?.id ?? null,
    connectionStatus: conn?.status ?? null,
    restaurantId: conn?.externalStoreId ?? null,
    mode,
    webhookUrl,
    authorizeUrl,
    checklist: [
      { label: "Client credentials configured", done: capability.hasCredentials },
      { label: "OAuth connected", done: conn?.status === IntegrationStatus.CONNECTED },
      { label: "Restaurant ID configured", done: Boolean(conn?.externalStoreId?.trim()) },
      { label: "Webhook registered", done: Boolean(webhookUrl) },
    ],
  };
}

export async function importSkipLiveOrders(userId: string) {
  return importSkipOrdersForUser(userId);
}

export async function testSkipLiveConnection(userId: string) {
  return testSkipConnection(userId);
}

export async function getSkipLiveCredentials(userId: string) {
  return getSkipCredentialsForUser(userId);
}

export function mapSkipLiveOrderPreview(raw: Record<string, unknown>) {
  const normalized = normalizeSkipOrder(raw);
  return {
    externalOrderId: normalized.externalOrderId,
    displayId: normalized.externalOrderNumber ?? null,
    status: normalized.normalizedStatus,
    total: normalized.totals.total ?? null,
    imported: false,
    createdAt: new Date().toISOString(),
  };
}
