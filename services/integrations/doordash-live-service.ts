import { createHmac, timingSafeEqual } from "crypto";

import { IntegrationProvider, IntegrationStatus } from "@prisma/client";

import { SITE_URL } from "@/lib/constants";
import { decryptOptional, encryptOptional, isEncryptionConfigured } from "@/lib/crypto";
import type {
  DoorDashLiveConnectionSettings,
  DoorDashLiveDashboard,
  DoorDashLiveOrderRow,
} from "@/lib/integrations/doordash-live-types";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { getDoorDashCredentialsForUser } from "@/services/integrations/doordash/doordash-credentials";
import { processDoorDashInboundOrder } from "@/services/integrations/doordash/inbound-order.service";
import {
  fetchDoorDashMarketplaceOrders,
  normalizeDoorDashOrder,
  verifyDoorDashWebhookSignature,
} from "@/services/integrations/doordash/doordash-marketplace";
import {
  getDoorDashCapabilitySnapshot,
  getDoorDashPlaceholderMessage,
  syncMenuToDoorDash,
} from "@/services/integrations/doordash/doordash-service";
import { importDoorDashOrdersForUser } from "@/services/integrations/doordash/order-import.service";

export { verifyDoorDashWebhookSignature };

const OAUTH_AUTHORIZE_URL =
  process.env.DOORDASH_OAUTH_AUTHORIZE_URL ?? "https://identity.doordash.com/auth";
const OAUTH_TOKEN_URL =
  process.env.DOORDASH_OAUTH_TOKEN_URL ?? "https://identity.doordash.com/auth/token";
const OAUTH_SCOPES = process.env.DOORDASH_OAUTH_SCOPES ?? "openid merchant_read order_read menu_write";

function oauthRedirectUri(): string {
  return (
    process.env.DOORDASH_OAUTH_REDIRECT_URI?.trim() ??
    `${SITE_URL}/api/integrations/doordash/oauth/callback`
  );
}

function stateSecret(): string {
  return (
    process.env.DOORDASH_OAUTH_STATE_SECRET?.trim() ??
    process.env.ENCRYPTION_KEY?.trim() ??
    "doordash-live-state-dev"
  );
}

function parseSettings(settingsJson: unknown): DoorDashLiveConnectionSettings {
  if (!settingsJson || typeof settingsJson !== "object") return {};
  return settingsJson as DoorDashLiveConnectionSettings;
}

function mergeSettings(
  current: unknown,
  patch: Partial<DoorDashLiveConnectionSettings>,
): DoorDashLiveConnectionSettings {
  return { ...parseSettings(current), ...patch };
}

export function signDoorDashOAuthState(payload: { userId: string; connectionId: string }): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", stateSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyDoorDashOAuthState(
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

export async function ensureDoorDashConnection(userId: string) {
  const where = await integrationConnectionByProviderWhereForOwner(
    userId,
    IntegrationProvider.DOORDASH,
  );
  const existing = await prisma.integrationConnection.findFirst({ where });
  if (existing) return existing;
  return prisma.integrationConnection.create({
    data: {
      userId,
      provider: IntegrationProvider.DOORDASH,
      name: "DoorDash",
      status: IntegrationStatus.NEEDS_AUTH,
    },
  });
}

export function buildDoorDashOAuthAuthorizeUrl(input: {
  userId: string;
  connectionId: string;
}): string | null {
  const clientId =
    process.env.DOORDASH_OAUTH_CLIENT_ID?.trim() ?? process.env.DOORDASH_API_KEY?.trim();
  if (!clientId) return null;

  const state = signDoorDashOAuthState(input);
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: oauthRedirectUri(),
    scope: OAUTH_SCOPES,
    state,
  });
  return `${OAUTH_AUTHORIZE_URL}?${params.toString()}`;
}

export async function completeDoorDashOAuth(input: {
  userId: string;
  connectionId: string;
  code: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const conn = await prisma.integrationConnection.findFirst({
    where: {
      id: input.connectionId,
      userId: input.userId,
      provider: IntegrationProvider.DOORDASH,
    },
  });
  if (!conn) return { ok: false, error: "Connection not found." };

  const clientId =
    process.env.DOORDASH_OAUTH_CLIENT_ID?.trim() ??
    decryptOptional(conn.consumerKeyEncrypted) ??
    process.env.DOORDASH_API_KEY?.trim();
  const clientSecret =
    process.env.DOORDASH_OAUTH_CLIENT_SECRET?.trim() ??
    decryptOptional(conn.consumerSecretEncrypted);

  if (!clientId || !clientSecret) {
    return { ok: false, error: "Configure DOORDASH_OAUTH_CLIENT_SECRET before OAuth connect." };
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
    return { ok: false, error: "DoorDash OAuth response missing access_token." };
  }

  const expiresAt =
    typeof json.expires_in === "number" ? Date.now() + json.expires_in * 1000 : null;

  const settings = mergeSettings(conn.settingsJson, {
    liveOAuth: {
      accessTokenEnc: encryptOptional(json.access_token)!,
      refreshTokenEnc: json.refresh_token ? encryptOptional(json.refresh_token) : null,
      expiresAt,
      scope: json.scope ?? OAUTH_SCOPES,
      connectedAt: new Date().toISOString(),
    },
    orderIngestionEnabled: true,
  });

  await prisma.integrationConnection.update({
    where: { id: conn.id },
    data: {
      settingsJson: settings,
      consumerKeyEncrypted: encryptOptional(json.access_token),
      status: IntegrationStatus.CONNECTED,
      lastError: null,
    },
  });

  return { ok: true };
}

export async function saveDoorDashLiveCredentials(input: {
  userId: string;
  name: string;
  merchantId: string;
  apiKey?: string;
  webhookSecret?: string;
  menuSyncEnabled?: boolean;
  orderIngestionEnabled?: boolean;
}): Promise<{ ok: true; connectionId: string } | { ok: false; error: string }> {
  if (!isEncryptionConfigured()) {
    return { ok: false, error: "Set ENCRYPTION_KEY before saving DoorDash credentials." };
  }

  const conn = await ensureDoorDashConnection(input.userId);
  const apiKeyEnc =
    input.apiKey?.trim() ? encryptOptional(input.apiKey.trim()) : conn.consumerKeyEncrypted;
  const webhookEnc =
    input.webhookSecret?.trim()
      ? encryptOptional(input.webhookSecret.trim())
      : conn.webhookSecretEncrypted;

  const settings = mergeSettings(conn.settingsJson, {
    menuSyncEnabled: input.menuSyncEnabled ?? false,
    orderIngestionEnabled: input.orderIngestionEnabled ?? true,
  });

  await prisma.integrationConnection.update({
    where: { id: conn.id },
    data: {
      name: input.name.trim().slice(0, 255) || "DoorDash",
      externalStoreId: input.merchantId.trim(),
      consumerKeyEncrypted: apiKeyEnc,
      webhookSecretEncrypted: webhookEnc,
      settingsJson: settings,
      status: apiKeyEnc ? IntegrationStatus.CONNECTED : IntegrationStatus.NEEDS_AUTH,
      lastError: apiKeyEnc
        ? null
        : "Save API key or complete OAuth to enable live marketplace traffic.",
    },
  });

  return { ok: true, connectionId: conn.id };
}

export async function getDoorDashLiveDashboard(userId: string): Promise<DoorDashLiveDashboard> {
  const capability = getDoorDashCapabilitySnapshot();
  const where = await integrationConnectionByProviderWhereForOwner(
    userId,
    IntegrationProvider.DOORDASH,
  );
  const conn = await prisma.integrationConnection.findFirst({ where });
  const settings = parseSettings(conn?.settingsJson);
  const oauthConnected = Boolean(settings.liveOAuth?.accessTokenEnc);
  const hasSavedKey = Boolean(conn?.consumerKeyEncrypted);
  const mode = capability.hasCredentials || oauthConnected || hasSavedKey ? "live" : "placeholder";

  const webhookUrl = conn
    ? `${SITE_URL}/api/webhooks/doordash/orders?cid=${conn.id}`
    : null;

  const authorizeUrl =
    conn && !oauthConnected ? buildDoorDashOAuthAuthorizeUrl({ userId, connectionId: conn.id }) : null;

  let recentOrders: DoorDashLiveOrderRow[] = [];
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
      const normalized = normalizeDoorDashOrder(raw);
      return {
        externalOrderId: row.externalOrderId,
        displayId: normalized.externalOrderNumber,
        status: row.sourceStatus ?? normalized.normalizedStatus,
        total: normalized.totals.total,
        imported: Boolean(row.importedOrderId),
        createdAt: row.createdAt.toISOString(),
      };
    });
  }

  const checklist = [
    { label: "API key or OAuth token saved", done: hasSavedKey || oauthConnected },
    { label: "OAuth connected", done: oauthConnected },
    { label: "Merchant ID configured", done: Boolean(conn?.externalStoreId?.trim()) },
    { label: "Webhook secret saved", done: Boolean(conn?.webhookSecretEncrypted) },
    {
      label: "Webhook registered",
      done: Boolean(webhookUrl && settings.orderIngestionEnabled !== false),
    },
    { label: "Menu sync enabled", done: Boolean(settings.menuSyncEnabled) },
    {
      label: "Live credentials (env or connection)",
      done: capability.hasCredentials || oauthConnected || hasSavedKey,
    },
  ];

  return {
    connectionId: conn?.id ?? null,
    connectionStatus: conn?.status ?? null,
    merchantId: conn?.externalStoreId ?? null,
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

export async function syncDoorDashLiveMenu(userId: string) {
  const creds = await getDoorDashCredentialsForUser(userId);
  if (!creds) throw new Error(getDoorDashPlaceholderMessage(false));

  const result = await syncMenuToDoorDash(userId);
  const where = await integrationConnectionByProviderWhereForOwner(userId, IntegrationProvider.DOORDASH);
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

export async function importDoorDashLiveOrders(userId: string) {
  const creds = await getDoorDashCredentialsForUser(userId);
  if (!creds) throw new Error(getDoorDashPlaceholderMessage(false));

  const stats = await importDoorDashOrdersForUser(userId);
  const where = await integrationConnectionByProviderWhereForOwner(userId, IntegrationProvider.DOORDASH);
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

export async function testDoorDashLiveConnection(userId: string) {
  const creds = await getDoorDashCredentialsForUser(userId);
  if (!creds?.apiKey || !creds.merchantId) {
    return { ok: false as const, message: getDoorDashPlaceholderMessage(false) };
  }
  try {
    const orders = await fetchDoorDashMarketplaceOrders(creds);
    return {
      ok: true as const,
      message: `DoorDash marketplace API reachable (${orders.length} orders in latest poll).`,
    };
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "DoorDash connection test failed.",
    };
  }
}

export async function processDoorDashLiveWebhook(input: {
  userId: string;
  workspaceId?: string | null;
  connectionId: string;
  externalEventId: string;
  payload: Record<string, unknown>;
  webhookEventId?: string;
}) {
  return processDoorDashInboundOrder(input);
}

export function mapDoorDashLiveOrderPreview(raw: Record<string, unknown>): DoorDashLiveOrderRow {
  const normalized = normalizeDoorDashOrder(raw);
  return {
    externalOrderId: normalized.externalOrderId,
    displayId: normalized.externalOrderNumber,
    status: normalized.normalizedStatus,
    total: normalized.totals.total,
    imported: false,
    createdAt: new Date().toISOString(),
  };
}
