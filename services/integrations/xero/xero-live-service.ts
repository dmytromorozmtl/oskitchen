import { createHmac, timingSafeEqual } from "crypto";

import { IntegrationProvider, IntegrationStatus } from "@prisma/client";

import { SITE_URL } from "@/lib/constants";
import { encryptOptional } from "@/lib/crypto";
import type { XeroLiveDashboard } from "@/lib/integrations/xero-live-types";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { fetchXeroTenants } from "@/services/integrations/xero/xero-api";
import { getXeroCredentials, parseXeroSettings } from "@/services/integrations/xero/xero-credentials";

const OAUTH_AUTHORIZE_URL = "https://login.xero.com/identity/connect/authorize";
const OAUTH_TOKEN_URL = "https://identity.xero.com/connect/token";
const OAUTH_SCOPES = "accounting.transactions accounting.contacts offline_access";

function oauthRedirectUri(): string {
  return (
    process.env.XERO_OAUTH_REDIRECT_URI?.trim() ??
    `${SITE_URL}/api/integrations/xero/oauth/callback`
  );
}

function stateSecret(): string {
  return (
    process.env.XERO_OAUTH_STATE_SECRET?.trim() ??
    process.env.ENCRYPTION_KEY?.trim() ??
    "xero-live-state-dev"
  );
}

export function signXeroOAuthState(payload: { userId: string; connectionId: string }): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", stateSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyXeroOAuthState(
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

export async function ensureXeroConnection(userId: string) {
  const where = await integrationConnectionByProviderWhereForOwner(userId, IntegrationProvider.XERO);
  const existing = await prisma.integrationConnection.findFirst({ where });
  if (existing) return existing;
  return prisma.integrationConnection.create({
    data: {
      userId,
      provider: IntegrationProvider.XERO,
      name: "Xero",
      status: IntegrationStatus.NEEDS_AUTH,
    },
  });
}

export function buildXeroOAuthAuthorizeUrl(input: {
  userId: string;
  connectionId: string;
}): string | null {
  const clientId = process.env.XERO_CLIENT_ID?.trim();
  if (!clientId) return null;

  const state = signXeroOAuthState(input);
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    scope: OAUTH_SCOPES,
    redirect_uri: oauthRedirectUri(),
    state,
  });
  return `${OAUTH_AUTHORIZE_URL}?${params.toString()}`;
}

export async function completeXeroOAuth(input: {
  userId: string;
  connectionId: string;
  code: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const conn = await prisma.integrationConnection.findFirst({
    where: {
      id: input.connectionId,
      userId: input.userId,
      provider: IntegrationProvider.XERO,
    },
  });
  if (!conn) return { ok: false, error: "Connection not found." };

  const clientId = process.env.XERO_CLIENT_ID?.trim();
  const clientSecret = process.env.XERO_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return { ok: false, error: "XERO_CLIENT_ID and XERO_CLIENT_SECRET are required." };
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: input.code,
    redirect_uri: oauthRedirectUri(),
  });
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, error: text.slice(0, 300) || `Token exchange failed (${res.status})` };
  }

  const json = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
  };
  if (!json.access_token?.trim()) {
    return { ok: false, error: "Xero token response missing access_token." };
  }

  const tenants = await fetchXeroTenants(json.access_token.trim());
  const tenant = tenants[0];
  const settings = parseXeroSettings(conn.settingsJson);

  await prisma.integrationConnection.update({
    where: { id: conn.id },
    data: {
      status: IntegrationStatus.CONNECTED,
      accessTokenEncrypted: encryptOptional(json.access_token.trim()),
      refreshTokenEncrypted: encryptOptional(json.refresh_token?.trim() ?? null),
      externalStoreId: tenant?.tenantId ?? null,
      settingsJson: {
        ...settings,
        tenantId: tenant?.tenantId ?? null,
        tenantName: tenant?.tenantName ?? null,
      },
      lastError: null,
    },
  });

  return { ok: true };
}

export function getXeroLiveMessage(hasClientId = Boolean(process.env.XERO_CLIENT_ID?.trim())): string {
  return hasClientId
    ? "Xero LIVE — OAuth, supplier invoice sync, and bank reconciliation."
    : "Configure XERO_CLIENT_ID and XERO_CLIENT_SECRET to enable Xero LIVE.";
}

export async function getXeroLiveDashboard(userId: string): Promise<XeroLiveDashboard> {
  const conn = await ensureXeroConnection(userId);
  const creds = getXeroCredentials(conn);
  const settings = parseXeroSettings(conn.settingsJson);
  const hasClientId = Boolean(process.env.XERO_CLIENT_ID?.trim());
  const connected = Boolean(creds?.accessToken && creds.tenantId);

  return {
    mode: hasClientId ? "live" : "placeholder",
    oauthAuthorizeUrl: hasClientId
      ? buildXeroOAuthAuthorizeUrl({ userId, connectionId: conn.id })
      : null,
    connected,
    tenantId: creds?.tenantId ?? settings.tenantId ?? null,
    tenantName: settings.tenantName ?? null,
    lastInvoiceSyncAt: settings.lastInvoiceSyncAt ?? null,
    lastInvoicesSynced: settings.lastInvoicesSynced ?? null,
    lastBankReconcileAt: settings.lastBankReconcileAt ?? null,
    lastBankMatched: settings.lastBankMatched ?? null,
    message: getXeroLiveMessage(hasClientId),
  };
}
