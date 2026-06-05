import { createHmac, timingSafeEqual } from "crypto";

import { IntegrationProvider, IntegrationStatus } from "@prisma/client";

import { SITE_URL } from "@/lib/constants";
import { encryptOptional } from "@/lib/crypto";
import type {
  SquarePaymentsLiveConnectionSettings,
  SquarePaymentsLiveDashboard,
} from "@/lib/integrations/square-payments-live-types";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { exchangeSquareOAuthToken } from "@/services/integrations/square-payments/square-payments-api";
import {
  getSquarePaymentsCredentials,
  parseSquarePaymentsSettings,
} from "@/services/integrations/square-payments/square-payments-credentials";

const OAUTH_AUTHORIZE_URL = "https://connect.squareup.com/oauth2/authorize";
const OAUTH_SCOPES =
  process.env.SQUARE_PAYMENTS_OAUTH_SCOPES ??
  "PAYMENTS_WRITE PAYMENTS_READ MERCHANT_PROFILE_READ";

function oauthRedirectUri(): string {
  return (
    process.env.SQUARE_PAYMENTS_OAUTH_REDIRECT_URI?.trim() ??
    `${SITE_URL}/api/integrations/square-payments/oauth/callback`
  );
}

function stateSecret(): string {
  return (
    process.env.SQUARE_PAYMENTS_OAUTH_STATE_SECRET?.trim() ??
    process.env.ENCRYPTION_KEY?.trim() ??
    "square-payments-live-state-dev"
  );
}

export function signSquarePaymentsOAuthState(payload: {
  userId: string;
  connectionId: string;
}): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", stateSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifySquarePaymentsOAuthState(
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

export async function ensureSquarePaymentsConnection(userId: string) {
  const where = await integrationConnectionByProviderWhereForOwner(
    userId,
    IntegrationProvider.SQUARE_PAYMENTS,
  );
  const existing = await prisma.integrationConnection.findFirst({ where });
  if (existing) return existing;
  return prisma.integrationConnection.create({
    data: {
      userId,
      provider: IntegrationProvider.SQUARE_PAYMENTS,
      name: "Square Payments",
      status: IntegrationStatus.NEEDS_AUTH,
      externalStoreId: process.env.SQUARE_PAYMENTS_LOCATION_ID?.trim() ?? null,
    },
  });
}

export function buildSquarePaymentsOAuthAuthorizeUrl(input: {
  userId: string;
  connectionId: string;
}): string | null {
  const clientId = process.env.SQUARE_PAYMENTS_CLIENT_ID?.trim();
  if (!clientId) return null;

  const state = signSquarePaymentsOAuthState(input);
  const params = new URLSearchParams({
    client_id: clientId,
    scope: OAUTH_SCOPES,
    session: "false",
    state,
    redirect_uri: oauthRedirectUri(),
  });
  return `${OAUTH_AUTHORIZE_URL}?${params.toString()}`;
}

export async function completeSquarePaymentsOAuth(input: {
  userId: string;
  connectionId: string;
  code: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const conn = await prisma.integrationConnection.findFirst({
    where: {
      id: input.connectionId,
      userId: input.userId,
      provider: IntegrationProvider.SQUARE_PAYMENTS,
    },
  });
  if (!conn) return { ok: false, error: "Connection not found." };

  const token = await exchangeSquareOAuthToken({ code: input.code });
  if (!token.ok) return token;

  const settings = parseSquarePaymentsSettings(conn.settingsJson);

  await prisma.integrationConnection.update({
    where: { id: conn.id },
    data: {
      status: IntegrationStatus.CONNECTED,
      accessTokenEncrypted: encryptOptional(token.accessToken),
      refreshTokenEncrypted: encryptOptional(token.refreshToken),
      externalStoreId:
        process.env.SQUARE_PAYMENTS_LOCATION_ID?.trim() ??
        conn.externalStoreId ??
        null,
      settingsJson: {
        ...settings,
        merchantId: token.merchantId,
      },
      lastError: null,
    },
  });

  return { ok: true };
}

export function getSquarePaymentsLiveMessage(
  hasClientId = Boolean(process.env.SQUARE_PAYMENTS_CLIENT_ID?.trim()),
): string {
  return hasClientId
    ? "Square Payments LIVE — OAuth, payment processing, and refund sync."
    : "Configure SQUARE_PAYMENTS_CLIENT_ID and SQUARE_PAYMENTS_CLIENT_SECRET.";
}

export async function getSquarePaymentsLiveDashboard(
  userId: string,
): Promise<SquarePaymentsLiveDashboard> {
  const conn = await ensureSquarePaymentsConnection(userId);
  const creds = getSquarePaymentsCredentials(conn);
  const settings = parseSquarePaymentsSettings(conn.settingsJson);
  const hasClientId = Boolean(process.env.SQUARE_PAYMENTS_CLIENT_ID?.trim());
  const connected = Boolean(creds?.accessToken && creds.locationId);

  return {
    mode: hasClientId ? "live" : "placeholder",
    oauthAuthorizeUrl: hasClientId
      ? buildSquarePaymentsOAuthAuthorizeUrl({ userId, connectionId: conn.id })
      : null,
    connected,
    locationId: creds?.locationId ?? conn.externalStoreId ?? null,
    lastPaymentAt: settings.lastPaymentAt ?? null,
    lastPaymentId: settings.lastPaymentId ?? null,
    lastRefundSyncAt: settings.lastRefundSyncAt ?? null,
    lastRefundSynced: settings.lastRefundSynced ?? null,
    message: getSquarePaymentsLiveMessage(hasClientId),
  };
}

export async function updateSquarePaymentsLiveSettings(
  userId: string,
  patch: Partial<SquarePaymentsLiveConnectionSettings>,
): Promise<void> {
  const conn = await ensureSquarePaymentsConnection(userId);
  const current = parseSquarePaymentsSettings(conn.settingsJson);
  const next: SquarePaymentsLiveConnectionSettings = { ...current, ...patch };
  await prisma.integrationConnection.update({
    where: { id: conn.id },
    data: { settingsJson: next },
  });
}
