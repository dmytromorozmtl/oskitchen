import { createHmac, timingSafeEqual } from "crypto";

import { IntegrationProvider, IntegrationStatus } from "@prisma/client";

import { SITE_URL } from "@/lib/constants";
import { encryptOptional } from "@/lib/crypto";
import type { QuickBooksLiveDashboard } from "@/lib/integrations/quickbooks-live-types";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { fetchQuickBooksRealmId } from "@/services/integrations/quickbooks/quickbooks-api";
import {
  getQuickBooksCredentials,
  parseQuickBooksSettings,
} from "@/services/integrations/quickbooks/quickbooks-credentials";

const OAUTH_AUTHORIZE_URL = "https://appcenter.intuit.com/connect/oauth2";
const OAUTH_TOKEN_URL = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
const OAUTH_SCOPES = "com.intuit.quickbooks.accounting openid profile email";

function oauthRedirectUri(): string {
  return (
    process.env.QUICKBOOKS_OAUTH_REDIRECT_URI?.trim() ??
    `${SITE_URL}/api/integrations/quickbooks/oauth/callback`
  );
}

function stateSecret(): string {
  return (
    process.env.QUICKBOOKS_OAUTH_STATE_SECRET?.trim() ??
    process.env.ENCRYPTION_KEY?.trim() ??
    "quickbooks-live-state-dev"
  );
}

export function signQuickBooksOAuthState(payload: { userId: string; connectionId: string }): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", stateSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyQuickBooksOAuthState(
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

export async function ensureQuickBooksConnection(userId: string) {
  const where = await integrationConnectionByProviderWhereForOwner(
    userId,
    IntegrationProvider.QUICKBOOKS,
  );
  const existing = await prisma.integrationConnection.findFirst({ where });
  if (existing) return existing;
  return prisma.integrationConnection.create({
    data: {
      userId,
      provider: IntegrationProvider.QUICKBOOKS,
      name: "QuickBooks",
      status: IntegrationStatus.NEEDS_AUTH,
    },
  });
}

export function buildQuickBooksOAuthAuthorizeUrl(input: {
  userId: string;
  connectionId: string;
}): string | null {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID?.trim();
  if (!clientId) return null;

  const state = signQuickBooksOAuthState(input);
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    scope: OAUTH_SCOPES,
    redirect_uri: oauthRedirectUri(),
    state,
  });
  return `${OAUTH_AUTHORIZE_URL}?${params.toString()}`;
}

export async function completeQuickBooksOAuth(input: {
  userId: string;
  connectionId: string;
  code: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const conn = await prisma.integrationConnection.findFirst({
    where: {
      id: input.connectionId,
      userId: input.userId,
      provider: IntegrationProvider.QUICKBOOKS,
    },
  });
  if (!conn) return { ok: false, error: "Connection not found." };

  const clientId = process.env.QUICKBOOKS_CLIENT_ID?.trim();
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return { ok: false, error: "QUICKBOOKS_CLIENT_ID and QUICKBOOKS_CLIENT_SECRET are required." };
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
    return { ok: false, error: "QuickBooks token response missing access_token." };
  }

  const realmId = await fetchQuickBooksRealmId(json.access_token.trim());
  const settings = parseQuickBooksSettings(conn.settingsJson);

  await prisma.integrationConnection.update({
    where: { id: conn.id },
    data: {
      status: IntegrationStatus.CONNECTED,
      accessTokenEncrypted: encryptOptional(json.access_token.trim()),
      refreshTokenEncrypted: encryptOptional(json.refresh_token?.trim() ?? null),
      externalStoreId: realmId,
      settingsJson: { ...settings, realmId },
      lastError: null,
    },
  });

  return { ok: true };
}

export function getQuickBooksLiveMessage(hasClientId = Boolean(process.env.QUICKBOOKS_CLIENT_ID?.trim())): string {
  return hasClientId
    ? "QuickBooks LIVE — OAuth, chart of accounts, and daily sales journal sync."
    : "Configure QUICKBOOKS_CLIENT_ID and QUICKBOOKS_CLIENT_SECRET to enable QuickBooks LIVE.";
}

export async function getQuickBooksLiveDashboard(userId: string): Promise<QuickBooksLiveDashboard> {
  const conn = await ensureQuickBooksConnection(userId);
  const creds = getQuickBooksCredentials(conn);
  const settings = parseQuickBooksSettings(conn.settingsJson);
  const hasClientId = Boolean(process.env.QUICKBOOKS_CLIENT_ID?.trim());
  const connected = Boolean(creds?.accessToken && creds.realmId);

  return {
    mode: hasClientId ? "live" : "placeholder",
    oauthAuthorizeUrl: hasClientId
      ? buildQuickBooksOAuthAuthorizeUrl({ userId, connectionId: conn.id })
      : null,
    connected,
    realmId: creds?.realmId ?? settings.realmId ?? null,
    salesAccountName: settings.salesAccountName ?? null,
    depositAccountName: settings.depositAccountName ?? null,
    lastJournalPostedAt: settings.lastJournalPostedAt ?? null,
    lastJournalAmount: settings.lastJournalAmount ?? null,
    message: getQuickBooksLiveMessage(hasClientId),
  };
}
