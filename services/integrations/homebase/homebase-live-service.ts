import { createHmac, timingSafeEqual } from "crypto";

import { IntegrationProvider, IntegrationStatus } from "@prisma/client";

import { SITE_URL } from "@/lib/constants";
import { encryptOptional } from "@/lib/crypto";
import type { HomebaseLiveDashboard } from "@/lib/integrations/homebase-live-types";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import {
  getHomebaseCredentials,
  parseHomebaseSettings,
} from "@/services/integrations/homebase/homebase-credentials";

const OAUTH_AUTHORIZE_URL =
  process.env.HOMEBASE_OAUTH_AUTHORIZE_URL ?? "https://app.joinhomebase.com/oauth/authorize";
const OAUTH_TOKEN_URL =
  process.env.HOMEBASE_OAUTH_TOKEN_URL ?? "https://api.joinhomebase.com/oauth/token";
const OAUTH_SCOPES =
  process.env.HOMEBASE_OAUTH_SCOPES ?? "shifts:read shifts:write timecards:read";

function oauthRedirectUri(): string {
  return (
    process.env.HOMEBASE_OAUTH_REDIRECT_URI?.trim() ??
    `${SITE_URL}/api/integrations/homebase/oauth/callback`
  );
}

function stateSecret(): string {
  return (
    process.env.HOMEBASE_OAUTH_STATE_SECRET?.trim() ??
    process.env.ENCRYPTION_KEY?.trim() ??
    "homebase-live-state-dev"
  );
}

export function signHomebaseOAuthState(payload: { userId: string; connectionId: string }): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", stateSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyHomebaseOAuthState(
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

export async function ensureHomebaseConnection(userId: string) {
  const where = await integrationConnectionByProviderWhereForOwner(
    userId,
    IntegrationProvider.HOMEBASE,
  );
  const existing = await prisma.integrationConnection.findFirst({ where });
  if (existing) return existing;
  return prisma.integrationConnection.create({
    data: {
      userId,
      provider: IntegrationProvider.HOMEBASE,
      name: "Homebase",
      status: IntegrationStatus.NEEDS_AUTH,
      externalStoreId: process.env.HOMEBASE_LOCATION_ID?.trim() ?? null,
    },
  });
}

export function buildHomebaseOAuthAuthorizeUrl(input: {
  userId: string;
  connectionId: string;
}): string | null {
  const clientId = process.env.HOMEBASE_CLIENT_ID?.trim();
  if (!clientId) return null;

  const state = signHomebaseOAuthState(input);
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    scope: OAUTH_SCOPES,
    redirect_uri: oauthRedirectUri(),
    state,
  });
  return `${OAUTH_AUTHORIZE_URL}?${params.toString()}`;
}

export async function completeHomebaseOAuth(input: {
  userId: string;
  connectionId: string;
  code: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const conn = await prisma.integrationConnection.findFirst({
    where: {
      id: input.connectionId,
      userId: input.userId,
      provider: IntegrationProvider.HOMEBASE,
    },
  });
  if (!conn) return { ok: false, error: "Connection not found." };

  const clientId = process.env.HOMEBASE_CLIENT_ID?.trim();
  const clientSecret = process.env.HOMEBASE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return { ok: false, error: "HOMEBASE_CLIENT_ID and HOMEBASE_CLIENT_SECRET are required." };
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: input.code,
    redirect_uri: oauthRedirectUri(),
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: {
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

  const json = (await res.json()) as { access_token?: string; refresh_token?: string };
  if (!json.access_token?.trim()) {
    return { ok: false, error: "Homebase token response missing access_token." };
  }

  const settings = parseHomebaseSettings(conn.settingsJson);

  await prisma.integrationConnection.update({
    where: { id: conn.id },
    data: {
      status: IntegrationStatus.CONNECTED,
      accessTokenEncrypted: encryptOptional(json.access_token.trim()),
      refreshTokenEncrypted: encryptOptional(json.refresh_token?.trim() ?? null),
      externalStoreId: conn.externalStoreId ?? process.env.HOMEBASE_LOCATION_ID?.trim() ?? null,
      settingsJson: settings,
      lastError: null,
    },
  });

  return { ok: true };
}

export function getHomebaseLiveMessage(
  hasClientId = Boolean(process.env.HOMEBASE_CLIENT_ID?.trim()),
): string {
  return hasClientId
    ? "Homebase LIVE — OAuth, schedule import/export, and time clock sync."
    : "Configure HOMEBASE_CLIENT_ID and HOMEBASE_CLIENT_SECRET to enable Homebase LIVE.";
}

export async function getHomebaseLiveDashboard(userId: string): Promise<HomebaseLiveDashboard> {
  const conn = await ensureHomebaseConnection(userId);
  const creds = getHomebaseCredentials(conn);
  const settings = parseHomebaseSettings(conn.settingsJson);
  const hasClientId = Boolean(process.env.HOMEBASE_CLIENT_ID?.trim());
  const connected = Boolean(creds?.accessToken && creds.locationId);

  return {
    mode: hasClientId ? "live" : "placeholder",
    oauthAuthorizeUrl: hasClientId
      ? buildHomebaseOAuthAuthorizeUrl({ userId, connectionId: conn.id })
      : null,
    connected,
    locationId: creds?.locationId ?? conn.externalStoreId ?? null,
    staffMappingCount: Object.keys(settings.staffMappings ?? {}).length,
    lastScheduleImportAt: settings.lastScheduleImportAt ?? null,
    lastScheduleExportAt: settings.lastScheduleExportAt ?? null,
    lastTimeClockSyncAt: settings.lastTimeClockSyncAt ?? null,
    lastTimeClockSynced: settings.lastTimeClockSynced ?? null,
    message: getHomebaseLiveMessage(hasClientId),
  };
}
