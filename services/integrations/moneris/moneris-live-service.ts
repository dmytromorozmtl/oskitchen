import { createHmac, timingSafeEqual } from "crypto";

import { IntegrationProvider, IntegrationStatus } from "@prisma/client";

import { SITE_URL } from "@/lib/constants";
import { encryptOptional } from "@/lib/crypto";
import type {
  MonerisLiveConnectionSettings,
  MonerisLiveDashboard,
} from "@/lib/integrations/moneris-live-types";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { exchangeMonerisOAuthToken, verifyMonerisGatewayConnection } from "@/services/integrations/moneris/moneris-api";
import {
  getMonerisCredentials,
  parseMonerisSettings,
} from "@/services/integrations/moneris/moneris-credentials";

const OAUTH_AUTHORIZE_URL =
  process.env.MONERIS_OAUTH_AUTHORIZE_URL ?? "https://api.moneris.com/oauth/authorize";
const OAUTH_SCOPES = process.env.MONERIS_OAUTH_SCOPES ?? "payments:write payments:read";

function oauthRedirectUri(): string {
  return (
    process.env.MONERIS_OAUTH_REDIRECT_URI?.trim() ??
    `${SITE_URL}/api/integrations/moneris/oauth/callback`
  );
}

function stateSecret(): string {
  return (
    process.env.MONERIS_OAUTH_STATE_SECRET?.trim() ??
    process.env.ENCRYPTION_KEY?.trim() ??
    "moneris-live-state-dev"
  );
}

export function signMonerisOAuthState(payload: { userId: string; connectionId: string }): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", stateSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyMonerisOAuthState(
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

export async function ensureMonerisConnection(userId: string) {
  const where = await integrationConnectionByProviderWhereForOwner(
    userId,
    IntegrationProvider.MONERIS,
  );
  const existing = await prisma.integrationConnection.findFirst({ where });
  if (existing) return existing;
  return prisma.integrationConnection.create({
    data: {
      userId,
      provider: IntegrationProvider.MONERIS,
      name: "Moneris",
      status: IntegrationStatus.NEEDS_AUTH,
      externalStoreId: process.env.MONERIS_STORE_ID?.trim() ?? null,
    },
  });
}

export function buildMonerisOAuthAuthorizeUrl(input: {
  userId: string;
  connectionId: string;
}): string | null {
  const clientId = process.env.MONERIS_CLIENT_ID?.trim();
  if (!clientId) return null;

  const state = signMonerisOAuthState(input);
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: OAUTH_SCOPES,
    redirect_uri: oauthRedirectUri(),
    state,
  });
  return `${OAUTH_AUTHORIZE_URL}?${params.toString()}`;
}

export async function completeMonerisOAuth(input: {
  userId: string;
  connectionId: string;
  code: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const conn = await prisma.integrationConnection.findFirst({
    where: {
      id: input.connectionId,
      userId: input.userId,
      provider: IntegrationProvider.MONERIS,
    },
  });
  if (!conn) return { ok: false, error: "Connection not found." };

  const token = await exchangeMonerisOAuthToken({ code: input.code });
  if (!token.ok) return token;

  const settings = parseMonerisSettings(conn.settingsJson);
  const storeId =
    token.storeId ??
    settings.storeId ??
    conn.externalStoreId ??
    process.env.MONERIS_STORE_ID?.trim() ??
    null;

  if (storeId) {
    const verified = await verifyMonerisGatewayConnection({
      accessToken: token.accessToken,
      apiToken: process.env.MONERIS_API_TOKEN?.trim() ?? null,
      storeId,
    });
    if (!verified.ok) return verified;
  }

  await prisma.integrationConnection.update({
    where: { id: conn.id },
    data: {
      status: IntegrationStatus.CONNECTED,
      accessTokenEncrypted: encryptOptional(token.accessToken),
      refreshTokenEncrypted: encryptOptional(
        token.refreshToken ?? process.env.MONERIS_API_TOKEN?.trim() ?? null,
      ),
      externalStoreId: storeId,
      settingsJson: { ...settings, storeId },
      lastError: null,
    },
  });

  return { ok: true };
}

export function getMonerisLiveMessage(
  hasClientId = Boolean(process.env.MONERIS_CLIENT_ID?.trim()),
): string {
  return hasClientId
    ? "Moneris LIVE — OAuth and payment gateway for Canadian card processing."
    : "Configure MONERIS_CLIENT_ID and MONERIS_CLIENT_SECRET to enable Moneris LIVE.";
}

export async function getMonerisLiveDashboard(userId: string): Promise<MonerisLiveDashboard> {
  const conn = await ensureMonerisConnection(userId);
  const creds = getMonerisCredentials(conn);
  const settings = parseMonerisSettings(conn.settingsJson);
  const hasClientId = Boolean(process.env.MONERIS_CLIENT_ID?.trim());
  const connected = Boolean(
    creds && (creds.accessToken || creds.apiToken) && creds.storeId && conn.status === IntegrationStatus.CONNECTED,
  );

  return {
    mode: hasClientId ? "live" : "placeholder",
    oauthAuthorizeUrl: hasClientId
      ? buildMonerisOAuthAuthorizeUrl({ userId, connectionId: conn.id })
      : null,
    connected,
    storeId: creds?.storeId ?? conn.externalStoreId ?? null,
    lastPaymentAt: settings.lastPaymentAt ?? null,
    lastTransactionId: settings.lastTransactionId ?? null,
    lastGatewayStatus: settings.lastGatewayStatus ?? null,
    message: getMonerisLiveMessage(hasClientId),
  };
}

export async function updateMonerisLiveSettings(
  userId: string,
  patch: Partial<MonerisLiveConnectionSettings>,
): Promise<void> {
  const conn = await ensureMonerisConnection(userId);
  const current = parseMonerisSettings(conn.settingsJson);
  const next: MonerisLiveConnectionSettings = { ...current, ...patch };
  await prisma.integrationConnection.update({
    where: { id: conn.id },
    data: { settingsJson: next },
  });
}
