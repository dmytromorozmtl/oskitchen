import { createHmac, randomBytes, timingSafeEqual } from "crypto";

import { IntegrationProvider, IntegrationStatus } from "@prisma/client";

import { SITE_URL } from "@/lib/constants";
import { decryptOptional, encryptOptional } from "@/lib/crypto";
import type {
  UberEatsLiveConnectionSettings,
  UberEatsLiveDashboard,
  UberEatsLiveOrderRow,
} from "@/lib/integrations/uber-eats-live-types";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { processUberEatsInboundOrder } from "@/services/integrations/uber-eats/inbound-order.service";
import { normalizeUberEatsMarketplaceOrder } from "@/services/integrations/uber-eats/uber-eats-marketplace";
import {
  getUberEatsCapabilitySnapshot,
  getUberEatsCredentialsForUser,
  syncMenuToUberEats,
  testUberEatsConnection,
} from "@/services/integrations/uber-eats/uber-eats-service";
import { importUberEatsOrdersForUser } from "@/services/integrations/uber-eats/order-import.service";
import { verifyUberEatsWebhookSignature } from "@/services/integrations/uber-eats";

export { verifyUberEatsWebhookSignature };

const OAUTH_AUTHORIZE_URL =
  process.env.UBER_EATS_OAUTH_AUTHORIZE_URL ?? "https://login.uber.com/oauth/v2/authorize";
const OAUTH_TOKEN_URL =
  process.env.UBER_EATS_TOKEN_URL ?? "https://login.uber.com/oauth/v2/token";
const OAUTH_SCOPES =
  process.env.UBER_EATS_OAUTH_SCOPES ?? "eats.store eats.order eats.store.status.write";

function oauthRedirectUri(): string {
  return (
    process.env.UBER_EATS_OAUTH_REDIRECT_URI?.trim() ??
    `${SITE_URL}/api/integrations/uber-eats/oauth/callback`
  );
}

function stateSecret(): string {
  return (
    process.env.UBER_EATS_OAUTH_STATE_SECRET?.trim() ??
    process.env.ENCRYPTION_KEY?.trim() ??
    "uber-eats-live-state-dev"
  );
}

function parseSettings(settingsJson: unknown): UberEatsLiveConnectionSettings {
  if (!settingsJson || typeof settingsJson !== "object") return {};
  return settingsJson as UberEatsLiveConnectionSettings;
}

function mergeSettings(
  current: unknown,
  patch: Partial<UberEatsLiveConnectionSettings>,
): UberEatsLiveConnectionSettings {
  return { ...parseSettings(current), ...patch };
}

export function signUberEatsOAuthState(payload: { userId: string; connectionId: string }): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", stateSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyUberEatsOAuthState(
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

export async function ensureUberEatsConnection(userId: string) {
  const where = await integrationConnectionByProviderWhereForOwner(
    userId,
    IntegrationProvider.UBER_EATS,
  );
  const existing = await prisma.integrationConnection.findFirst({ where });
  if (existing) return existing;
  return prisma.integrationConnection.create({
    data: {
      userId,
      provider: IntegrationProvider.UBER_EATS,
      name: "Uber Eats",
      status: IntegrationStatus.NEEDS_AUTH,
    },
  });
}

export function buildUberEatsOAuthAuthorizeUrl(input: {
  userId: string;
  connectionId: string;
}): string | null {
  const creds = {
    clientId: process.env.UBER_EATS_CLIENT_ID?.trim(),
  };
  if (!creds.clientId) return null;

  const state = signUberEatsOAuthState(input);
  const params = new URLSearchParams({
    client_id: creds.clientId,
    response_type: "code",
    redirect_uri: oauthRedirectUri(),
    scope: OAUTH_SCOPES,
    state,
  });
  return `${OAUTH_AUTHORIZE_URL}?${params.toString()}`;
}

export async function completeUberEatsOAuth(input: {
  userId: string;
  connectionId: string;
  code: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const conn = await prisma.integrationConnection.findFirst({
    where: {
      id: input.connectionId,
      userId: input.userId,
      provider: IntegrationProvider.UBER_EATS,
    },
  });
  if (!conn) return { ok: false, error: "Connection not found." };

  const clientId =
    decryptOptional(conn.consumerKeyEncrypted) ?? process.env.UBER_EATS_CLIENT_ID?.trim();
  const clientSecret =
    decryptOptional(conn.consumerSecretEncrypted) ?? process.env.UBER_EATS_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return { ok: false, error: "Save Uber Eats client ID and secret before OAuth." };
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

  const json = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
  };

  if (!json.access_token) {
    return { ok: false, error: "Uber OAuth response missing access_token." };
  }

  const expiresAt =
    typeof json.expires_in === "number"
      ? Date.now() + json.expires_in * 1000
      : null;

  const settings = mergeSettings(conn.settingsJson, {
    liveOAuth: {
      accessTokenEnc: encryptOptional(json.access_token)!,
      refreshTokenEnc: json.refresh_token ? encryptOptional(json.refresh_token) : null,
      expiresAt,
      scope: json.scope ?? OAUTH_SCOPES,
      connectedAt: new Date().toISOString(),
    },
  });

  await prisma.integrationConnection.update({
    where: { id: conn.id },
    data: {
      settingsJson: settings,
      status: IntegrationStatus.CONNECTED,
      lastError: null,
    },
  });

  return { ok: true };
}

export async function getUberEatsLiveDashboard(userId: string): Promise<UberEatsLiveDashboard> {
  const capability = getUberEatsCapabilitySnapshot();
  const where = await integrationConnectionByProviderWhereForOwner(
    userId,
    IntegrationProvider.UBER_EATS,
  );
  const conn = await prisma.integrationConnection.findFirst({ where });
  const settings = parseSettings(conn?.settingsJson);
  const oauthConnected = Boolean(settings.liveOAuth?.accessTokenEnc);
  const mode = capability.hasCredentials || oauthConnected ? "live" : "placeholder";

  const webhookUrl = conn
    ? `${SITE_URL}/api/webhooks/uber-eats/orders?cid=${conn.id}`
    : null;

  const authorizeUrl =
    conn && !oauthConnected
      ? buildUberEatsOAuthAuthorizeUrl({ userId, connectionId: conn.id })
      : null;

  let recentOrders: UberEatsLiveOrderRow[] = [];
  if (conn) {
    const rows = await prisma.externalOrder.findMany({
      where: { connectionId: conn.id },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        externalOrderId: true,
        sourceStatus: true,
        importedOrderId: true,
        createdAt: true,
        rawPayloadJson: true,
      },
    });
    recentOrders = rows.map((row) => {
      const raw =
        row.rawPayloadJson && typeof row.rawPayloadJson === "object"
          ? (row.rawPayloadJson as Record<string, unknown>)
          : {};
      const normalized = normalizeUberEatsMarketplaceOrder(raw);
      return {
        externalOrderId: row.externalOrderId,
        displayId: normalized.externalOrderNumber ?? null,
        status: row.sourceStatus ?? normalized.normalizedStatus,
        total: normalized.totals.total ?? null,
        imported: Boolean(row.importedOrderId),
        createdAt: row.createdAt.toISOString(),
      };
    });
  }

  const checklist = [
    { label: "Client credentials saved", done: Boolean(conn?.consumerKeyEncrypted) },
    { label: "OAuth connected", done: oauthConnected },
    { label: "Store UUID configured", done: Boolean(conn?.externalStoreId?.trim()) },
    { label: "Webhook registered", done: Boolean(webhookUrl && settings.orderIngestionEnabled !== false) },
    { label: "Menu sync enabled", done: Boolean(settings.menuSyncEnabled) },
    {
      label: "Live API credentials (env or saved)",
      done: capability.hasCredentials || oauthConnected,
    },
  ];

  return {
    connectionId: conn?.id ?? null,
    connectionStatus: conn?.status ?? null,
    storeId: conn?.externalStoreId ?? null,
    mode,
    oauthConnected,
    webhookUrl,
    authorizeUrl,
    menuSyncEnabled: settings.menuSyncEnabled ?? false,
    orderIngestionEnabled: settings.orderIngestionEnabled ?? true,
    lastMenuSyncAt: settings.lastMenuSyncAt ?? null,
    lastOrderImportAt: settings.lastOrderImportAt ?? null,
    recentOrders,
    checklist,
  };
}

export async function syncUberEatsLiveMenu(userId: string) {
  const result = await syncMenuToUberEats(userId);
  const where = await integrationConnectionByProviderWhereForOwner(
    userId,
    IntegrationProvider.UBER_EATS,
  );
  const conn = await prisma.integrationConnection.findFirst({ where });
  if (conn) {
    await prisma.integrationConnection.update({
      where: { id: conn.id },
      data: {
        settingsJson: mergeSettings(conn.settingsJson, {
          menuSyncEnabled: true,
          lastMenuSyncAt: new Date().toISOString(),
        }),
        lastError: result.ok ? null : result.message ?? "Menu sync failed",
      },
    });
  }
  return result;
}

export async function importUberEatsLiveOrders(userId: string) {
  const stats = await importUberEatsOrdersForUser(userId);
  const where = await integrationConnectionByProviderWhereForOwner(
    userId,
    IntegrationProvider.UBER_EATS,
  );
  const conn = await prisma.integrationConnection.findFirst({ where });
  if (conn) {
    await prisma.integrationConnection.update({
      where: { id: conn.id },
      data: {
        settingsJson: mergeSettings(conn.settingsJson, {
          orderIngestionEnabled: true,
          lastOrderImportAt: new Date().toISOString(),
        }),
        status: IntegrationStatus.CONNECTED,
        lastError: null,
      },
    });
  }
  return stats;
}

export async function testUberEatsLiveConnection(userId: string) {
  return testUberEatsConnection(userId);
}

export async function processUberEatsLiveWebhook(input: {
  userId: string;
  workspaceId?: string | null;
  connectionId: string;
  externalEventId: string;
  payload: Record<string, unknown>;
  webhookEventId?: string;
}) {
  return processUberEatsInboundOrder(input);
}

export function mapUberEatsLiveOrderPreview(
  raw: Record<string, unknown>,
): UberEatsLiveOrderRow {
  const normalized = normalizeUberEatsMarketplaceOrder(raw);
  return {
    externalOrderId: normalized.externalOrderId,
    displayId: normalized.externalOrderNumber ?? null,
    status: normalized.normalizedStatus,
    total: normalized.totals.total ?? null,
    imported: false,
    createdAt: new Date().toISOString(),
  };
}

export async function getUberEatsLiveCredentials(userId: string) {
  return getUberEatsCredentialsForUser(userId);
}

/** Dev-only: generate opaque OAuth state for tests. */
export function generateUberEatsOAuthStateNonce(): string {
  return randomBytes(12).toString("hex");
}
