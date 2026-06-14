import { createHmac, timingSafeEqual } from "crypto";

import { IntegrationProvider, IntegrationStatus } from "@prisma/client";

import { SITE_URL } from "@/lib/constants";
import { encryptOptional } from "@/lib/crypto";
import type { ResyLiveDashboard } from "@/lib/integrations/resy-live-types";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { getResyCredentials, parseResySettings } from "@/services/integrations/resy/resy-credentials";

const OAUTH_AUTHORIZE_URL =
  process.env.RESY_OAUTH_AUTHORIZE_URL ?? "https://api.resy.com/oauth/authorize";
const OAUTH_TOKEN_URL = process.env.RESY_OAUTH_TOKEN_URL ?? "https://api.resy.com/oauth/token";
const OAUTH_SCOPES =
  process.env.RESY_OAUTH_SCOPES ??
  "reservations.read reservations.write waitlist.read waitlist.write";

function oauthRedirectUri(): string {
  return (
    process.env.RESY_OAUTH_REDIRECT_URI?.trim() ??
    `${SITE_URL}/api/integrations/resy/oauth/callback`
  );
}

function stateSecret(): string {
  return (
    process.env.RESY_OAUTH_STATE_SECRET?.trim() ??
    process.env.ENCRYPTION_KEY?.trim() ??
    "resy-live-state-dev"
  );
}

export function signResyOAuthState(payload: { userId: string; connectionId: string }): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", stateSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyResyOAuthState(
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

export function verifyResyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string,
): boolean {
  if (!signature?.trim() || !secret?.trim()) return false;
  const expected = createHmac("sha256", secret.trim()).update(rawBody).digest("hex");
  const provided = signature.trim().replace(/^sha256=/i, "");
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
  } catch {
    return expected === provided;
  }
}

export async function ensureResyConnection(userId: string) {
  const where = await integrationConnectionByProviderWhereForOwner(userId, IntegrationProvider.RESY);
  const existing = await prisma.integrationConnection.findFirst({ where });
  if (existing) return existing;
  return prisma.integrationConnection.create({
    data: {
      userId,
      provider: IntegrationProvider.RESY,
      name: "Resy",
      status: IntegrationStatus.NEEDS_AUTH,
      externalStoreId: process.env.RESY_VENUE_ID?.trim() ?? null,
    },
  });
}

export function buildResyOAuthAuthorizeUrl(input: {
  userId: string;
  connectionId: string;
}): string | null {
  const clientId = process.env.RESY_CLIENT_ID?.trim();
  if (!clientId) return null;

  const state = signResyOAuthState(input);
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    scope: OAUTH_SCOPES,
    redirect_uri: oauthRedirectUri(),
    state,
  });
  return `${OAUTH_AUTHORIZE_URL}?${params.toString()}`;
}

export async function completeResyOAuth(input: {
  userId: string;
  connectionId: string;
  code: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const conn = await prisma.integrationConnection.findFirst({
    where: {
      id: input.connectionId,
      userId: input.userId,
      provider: IntegrationProvider.RESY,
    },
  });
  if (!conn) return { ok: false, error: "Connection not found." };

  const clientId = process.env.RESY_CLIENT_ID?.trim();
  const clientSecret = process.env.RESY_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return { ok: false, error: "RESY_CLIENT_ID and RESY_CLIENT_SECRET are required." };
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
    return { ok: false, error: "Resy token response missing access_token." };
  }

  const settings = parseResySettings(conn.settingsJson);
  const webhookSecret = process.env.RESY_WEBHOOK_SECRET?.trim();

  await prisma.integrationConnection.update({
    where: { id: conn.id },
    data: {
      status: IntegrationStatus.CONNECTED,
      accessTokenEncrypted: encryptOptional(json.access_token.trim()),
      refreshTokenEncrypted: encryptOptional(json.refresh_token?.trim() ?? null),
      webhookSecretEncrypted: webhookSecret ? encryptOptional(webhookSecret) : conn.webhookSecretEncrypted,
      externalStoreId: conn.externalStoreId ?? process.env.RESY_VENUE_ID?.trim() ?? null,
      settingsJson: settings,
      lastError: null,
    },
  });

  return { ok: true };
}

export function getResyLiveMessage(hasClientId = Boolean(process.env.RESY_CLIENT_ID?.trim())): string {
  return hasClientId
    ? "Resy LIVE — OAuth, reservation sync, and waitlist management."
    : "Configure RESY_CLIENT_ID and RESY_CLIENT_SECRET to enable Resy LIVE.";
}

export async function getResyLiveDashboard(userId: string): Promise<ResyLiveDashboard> {
  const conn = await ensureResyConnection(userId);
  let settings = parseResySettings(conn.settingsJson);

  if (!settings.storefrontId?.trim()) {
    const { findAdminStorefront } = await import("@/lib/storefront/load-admin-storefront");
    const sf = await findAdminStorefront(userId, { id: true });
    if (sf?.id) {
      settings = { ...settings, storefrontId: sf.id };
      await prisma.integrationConnection.update({
        where: { id: conn.id },
        data: { settingsJson: settings },
      });
    }
  }

  const creds = getResyCredentials(conn);
  const hasClientId = Boolean(process.env.RESY_CLIENT_ID?.trim());
  const connected = Boolean(creds?.accessToken && creds.venueId);

  return {
    mode: hasClientId ? "live" : "placeholder",
    oauthAuthorizeUrl: hasClientId
      ? buildResyOAuthAuthorizeUrl({ userId, connectionId: conn.id })
      : null,
    webhookUrl: `${SITE_URL}/api/webhooks/resy/reservations?cid=${conn.id}`,
    connected,
    venueId: creds?.venueId ?? conn.externalStoreId ?? null,
    storefrontId: settings.storefrontId ?? null,
    lastReservationSyncAt: settings.lastReservationSyncAt ?? null,
    lastWaitlistSyncAt: settings.lastWaitlistSyncAt ?? null,
    message: getResyLiveMessage(hasClientId),
  };
}
