import { createHmac, timingSafeEqual } from "crypto";

import { IntegrationProvider, IntegrationStatus } from "@prisma/client";

import { SITE_URL } from "@/lib/constants";
import { encryptOptional } from "@/lib/crypto";
import type { SevenShiftsLiveDashboard } from "@/lib/integrations/seven-shifts-live-types";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import {
  getSevenShiftsCredentials,
  parseSevenShiftsSettings,
} from "@/services/integrations/seven-shifts/seven-shifts-credentials";

const OAUTH_AUTHORIZE_URL =
  process.env.SEVENSHIFTS_OAUTH_AUTHORIZE_URL ?? "https://app.7shifts.com/oauth/authorize";
const OAUTH_TOKEN_URL =
  process.env.SEVENSHIFTS_OAUTH_TOKEN_URL ?? "https://api.7shifts.com/oauth2/token";
const OAUTH_SCOPES =
  process.env.SEVENSHIFTS_OAUTH_SCOPES ?? "shifts:read shifts:write labor:read company:read";

function oauthRedirectUri(): string {
  return (
    process.env.SEVENSHIFTS_OAUTH_REDIRECT_URI?.trim() ??
    `${SITE_URL}/api/integrations/7shifts/oauth/callback`
  );
}

function stateSecret(): string {
  return (
    process.env.SEVENSHIFTS_OAUTH_STATE_SECRET?.trim() ??
    process.env.ENCRYPTION_KEY?.trim() ??
    "seven-shifts-live-state-dev"
  );
}

export function signSevenShiftsOAuthState(payload: { userId: string; connectionId: string }): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", stateSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifySevenShiftsOAuthState(
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

export async function ensureSevenShiftsConnection(userId: string) {
  const where = await integrationConnectionByProviderWhereForOwner(
    userId,
    IntegrationProvider.SEVEN_SHIFTS,
  );
  const existing = await prisma.integrationConnection.findFirst({ where });
  if (existing) return existing;
  return prisma.integrationConnection.create({
    data: {
      userId,
      provider: IntegrationProvider.SEVEN_SHIFTS,
      name: "7shifts",
      status: IntegrationStatus.NEEDS_AUTH,
      externalStoreId: process.env.SEVENSHIFTS_COMPANY_ID?.trim() ?? null,
    },
  });
}

export function buildSevenShiftsOAuthAuthorizeUrl(input: {
  userId: string;
  connectionId: string;
}): string | null {
  const clientId = process.env.SEVENSHIFTS_CLIENT_ID?.trim();
  if (!clientId) return null;

  const state = signSevenShiftsOAuthState(input);
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    scope: OAUTH_SCOPES,
    redirect_uri: oauthRedirectUri(),
    state,
  });
  return `${OAUTH_AUTHORIZE_URL}?${params.toString()}`;
}

export async function completeSevenShiftsOAuth(input: {
  userId: string;
  connectionId: string;
  code: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const conn = await prisma.integrationConnection.findFirst({
    where: {
      id: input.connectionId,
      userId: input.userId,
      provider: IntegrationProvider.SEVEN_SHIFTS,
    },
  });
  if (!conn) return { ok: false, error: "Connection not found." };

  const clientId = process.env.SEVENSHIFTS_CLIENT_ID?.trim();
  const clientSecret = process.env.SEVENSHIFTS_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return { ok: false, error: "SEVENSHIFTS_CLIENT_ID and SEVENSHIFTS_CLIENT_SECRET are required." };
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
    return { ok: false, error: "7shifts token response missing access_token." };
  }

  const settings = parseSevenShiftsSettings(conn.settingsJson);

  await prisma.integrationConnection.update({
    where: { id: conn.id },
    data: {
      status: IntegrationStatus.CONNECTED,
      accessTokenEncrypted: encryptOptional(json.access_token.trim()),
      refreshTokenEncrypted: encryptOptional(json.refresh_token?.trim() ?? null),
      externalStoreId: conn.externalStoreId ?? process.env.SEVENSHIFTS_COMPANY_ID?.trim() ?? null,
      settingsJson: settings,
      lastError: null,
    },
  });

  return { ok: true };
}

export function getSevenShiftsLiveMessage(
  hasClientId = Boolean(process.env.SEVENSHIFTS_CLIENT_ID?.trim()),
): string {
  return hasClientId
    ? "7shifts LIVE — OAuth, schedule import/export, and labor cost sync."
    : "Configure SEVENSHIFTS_CLIENT_ID and SEVENSHIFTS_CLIENT_SECRET to enable 7shifts LIVE.";
}

export async function getSevenShiftsLiveDashboard(userId: string): Promise<SevenShiftsLiveDashboard> {
  const conn = await ensureSevenShiftsConnection(userId);
  const creds = getSevenShiftsCredentials(conn);
  const settings = parseSevenShiftsSettings(conn.settingsJson);
  const hasClientId = Boolean(process.env.SEVENSHIFTS_CLIENT_ID?.trim());
  const connected = Boolean(creds?.accessToken && creds.companyId);

  return {
    mode: hasClientId ? "live" : "placeholder",
    oauthAuthorizeUrl: hasClientId
      ? buildSevenShiftsOAuthAuthorizeUrl({ userId, connectionId: conn.id })
      : null,
    connected,
    companyId: creds?.companyId ?? conn.externalStoreId ?? null,
    staffMappingCount: Object.keys(settings.staffMappings ?? {}).length,
    lastScheduleImportAt: settings.lastScheduleImportAt ?? null,
    lastScheduleExportAt: settings.lastScheduleExportAt ?? null,
    lastLaborSyncAt: settings.lastLaborSyncAt ?? null,
    lastLaborTotal: settings.lastLaborTotal ?? null,
    message: getSevenShiftsLiveMessage(hasClientId),
  };
}
