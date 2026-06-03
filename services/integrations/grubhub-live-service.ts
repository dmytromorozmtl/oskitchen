import { createHmac, timingSafeEqual } from "crypto";

import { IntegrationProvider, IntegrationStatus } from "@prisma/client";

import { SITE_URL } from "@/lib/constants";
import { decryptOptional, encryptOptional, isEncryptionConfigured } from "@/lib/crypto";
import type {
  GrubhubLiveConnectionSettings,
  GrubhubLiveDashboard,
  GrubhubLiveOrderRow,
} from "@/lib/integrations/grubhub-live-types";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { getGrubhubCredentialsForUser } from "@/services/integrations/grubhub/grubhub-credentials";
import { processGrubhubInboundOrder } from "@/services/integrations/grubhub/inbound-order.service";
import {
  fetchGrubhubMarketplaceOrders,
  normalizeGrubhubOrder,
  verifyGrubhubWebhookSignature,
} from "@/services/integrations/grubhub/grubhub-marketplace";
import {
  getGrubhubCapabilitySnapshot,
  getGrubhubBetaMessage,
  syncMenuToGrubhub,
} from "@/services/integrations/grubhub/grubhub-service";
import { importGrubhubOrdersForUser } from "@/services/integrations/grubhub/order-import.service";

export { verifyGrubhubWebhookSignature };

const OAUTH_AUTHORIZE_URL =
  process.env.GRUBHUB_OAUTH_AUTHORIZE_URL ?? "https://api-gtm.grubhub.com/oauth/authorize";
const OAUTH_TOKEN_URL =
  process.env.GRUBHUB_OAUTH_TOKEN_URL ?? "https://api-gtm.grubhub.com/oauth/token";
const OAUTH_SCOPES =
  process.env.GRUBHUB_OAUTH_SCOPES ?? "merchant.orders.read merchant.orders.write merchant.menu.write";

function oauthRedirectUri(): string {
  return (
    process.env.GRUBHUB_OAUTH_REDIRECT_URI?.trim() ??
    `${SITE_URL}/api/integrations/grubhub/oauth/callback`
  );
}

function stateSecret(): string {
  return (
    process.env.GRUBHUB_OAUTH_STATE_SECRET?.trim() ??
    process.env.ENCRYPTION_KEY?.trim() ??
    "grubhub-live-state-dev"
  );
}

function parseSettings(settingsJson: unknown): GrubhubLiveConnectionSettings {
  if (!settingsJson || typeof settingsJson !== "object") return {};
  return settingsJson as GrubhubLiveConnectionSettings;
}

function mergeSettings(
  current: unknown,
  patch: Partial<GrubhubLiveConnectionSettings>,
): GrubhubLiveConnectionSettings {
  return { ...parseSettings(current), ...patch };
}

export function signGrubhubOAuthState(payload: { userId: string; connectionId: string }): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", stateSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyGrubhubOAuthState(
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

export async function ensureGrubhubConnection(userId: string) {
  const where = await integrationConnectionByProviderWhereForOwner(
    userId,
    IntegrationProvider.GRUBHUB,
  );
  const existing = await prisma.integrationConnection.findFirst({ where });
  if (existing) return existing;
  return prisma.integrationConnection.create({
    data: {
      userId,
      provider: IntegrationProvider.GRUBHUB,
      name: "Grubhub",
      status: IntegrationStatus.NEEDS_AUTH,
    },
  });
}

export function buildGrubhubOAuthAuthorizeUrl(input: {
  userId: string;
  connectionId: string;
}): string | null {
  const clientId =
    process.env.GRUBHUB_OAUTH_CLIENT_ID?.trim() ?? process.env.GRUBHUB_API_KEY?.trim();
  if (!clientId) return null;

  const state = signGrubhubOAuthState(input);
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: oauthRedirectUri(),
    scope: OAUTH_SCOPES,
    state,
  });
  return `${OAUTH_AUTHORIZE_URL}?${params.toString()}`;
}

export async function completeGrubhubOAuth(input: {
  userId: string;
  connectionId: string;
  code: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const conn = await prisma.integrationConnection.findFirst({
    where: {
      id: input.connectionId,
      userId: input.userId,
      provider: IntegrationProvider.GRUBHUB,
    },
  });
  if (!conn) return { ok: false, error: "Connection not found." };

  const clientId =
    process.env.GRUBHUB_OAUTH_CLIENT_ID?.trim() ??
    decryptOptional(conn.consumerKeyEncrypted) ??
    process.env.GRUBHUB_API_KEY?.trim();
  const clientSecret =
    process.env.GRUBHUB_OAUTH_CLIENT_SECRET?.trim() ??
    decryptOptional(conn.consumerSecretEncrypted);

  if (!clientId || !clientSecret) {
    return { ok: false, error: "Configure GRUBHUB_OAUTH_CLIENT_SECRET before OAuth connect." };
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
    return { ok: false, error: "Grubhub OAuth response missing access_token." };
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

export async function saveGrubhubLiveCredentials(input: {
  userId: string;
  name: string;
  merchantId: string;
  apiKey?: string;
  webhookSecret?: string;
  menuSyncEnabled?: boolean;
  orderIngestionEnabled?: boolean;
}): Promise<{ ok: true; connectionId: string } | { ok: false; error: string }> {
  if (!isEncryptionConfigured()) {
    return { ok: false, error: "Set ENCRYPTION_KEY before saving Grubhub credentials." };
  }

  const conn = await ensureGrubhubConnection(input.userId);
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
      name: input.name.trim().slice(0, 255) || "Grubhub",
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

export async function getGrubhubLiveDashboard(userId: string): Promise<GrubhubLiveDashboard> {
  const capability = getGrubhubCapabilitySnapshot();
  const where = await integrationConnectionByProviderWhereForOwner(
    userId,
    IntegrationProvider.GRUBHUB,
  );
  const conn = await prisma.integrationConnection.findFirst({ where });
  const settings = parseSettings(conn?.settingsJson);
  const oauthConnected = Boolean(settings.liveOAuth?.accessTokenEnc);
  const hasSavedKey = Boolean(conn?.consumerKeyEncrypted);
  const mode = capability.hasCredentials || oauthConnected || hasSavedKey ? "live" : "placeholder";

  const webhookUrl = conn
    ? `${SITE_URL}/api/webhooks/grubhub/orders?cid=${conn.id}`
    : null;

  const authorizeUrl =
    conn && !oauthConnected ? buildGrubhubOAuthAuthorizeUrl({ userId, connectionId: conn.id }) : null;

  let recentOrders: GrubhubLiveOrderRow[] = [];
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
      const normalized = normalizeGrubhubOrder(raw);
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

export async function syncGrubhubLiveMenu(userId: string) {
  const creds = await getGrubhubCredentialsForUser(userId);
  if (!creds) throw new Error(getGrubhubBetaMessage(false));

  const result = await syncMenuToGrubhub(userId);
  const where = await integrationConnectionByProviderWhereForOwner(
    userId,
    IntegrationProvider.GRUBHUB,
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

export async function importGrubhubLiveOrders(userId: string) {
  const creds = await getGrubhubCredentialsForUser(userId);
  if (!creds) throw new Error(getGrubhubBetaMessage(false));

  const stats = await importGrubhubOrdersForUser(userId);
  const where = await integrationConnectionByProviderWhereForOwner(
    userId,
    IntegrationProvider.GRUBHUB,
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

export async function testGrubhubLiveConnection(userId: string) {
  const creds = await getGrubhubCredentialsForUser(userId);
  if (!creds?.apiKey || !creds.merchantId) {
    return { ok: false as const, message: getGrubhubBetaMessage(false) };
  }
  try {
    const orders = await fetchGrubhubMarketplaceOrders(creds);
    return {
      ok: true as const,
      message: `Grubhub marketplace API reachable (${orders.length} orders in latest poll).`,
    };
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Grubhub connection test failed.",
    };
  }
}

export async function processGrubhubLiveWebhook(input: {
  userId: string;
  workspaceId?: string | null;
  connectionId: string;
  externalEventId: string;
  payload: Record<string, unknown>;
  webhookEventId?: string;
}) {
  return processGrubhubInboundOrder(input);
}

export function mapGrubhubLiveOrderPreview(raw: Record<string, unknown>): GrubhubLiveOrderRow {
  const normalized = normalizeGrubhubOrder(raw);
  return {
    externalOrderId: normalized.externalOrderId,
    displayId: normalized.externalOrderNumber ?? null,
    status: normalized.normalizedStatus,
    total: normalized.totals.total ?? null,
    imported: false,
    createdAt: new Date().toISOString(),
  };
}
