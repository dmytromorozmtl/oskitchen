import { createHmac, timingSafeEqual } from "crypto";

import { IntegrationProvider, IntegrationStatus } from "@prisma/client";

import { SITE_URL } from "@/lib/constants";
import { encryptOptional } from "@/lib/crypto";
import type { OpenTableLiveDashboard } from "@/lib/integrations/opentable-live-types";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import {
  getOpenTableCredentials,
  parseOpenTableSettings,
} from "@/services/integrations/opentable/opentable-credentials";

const OAUTH_AUTHORIZE_URL =
  process.env.OPENTABLE_OAUTH_AUTHORIZE_URL ?? "https://oauth.opentable.com/oauth2/authorize";
const OAUTH_TOKEN_URL =
  process.env.OPENTABLE_OAUTH_TOKEN_URL ?? "https://oauth.opentable.com/oauth2/token";
const OAUTH_SCOPES =
  process.env.OPENTABLE_OAUTH_SCOPES ??
  "reservation.read reservation.write availability.read availability.write";

function oauthRedirectUri(): string {
  return (
    process.env.OPENTABLE_OAUTH_REDIRECT_URI?.trim() ??
    `${SITE_URL}/api/integrations/opentable/oauth/callback`
  );
}

function stateSecret(): string {
  return (
    process.env.OPENTABLE_OAUTH_STATE_SECRET?.trim() ??
    process.env.ENCRYPTION_KEY?.trim() ??
    "opentable-live-state-dev"
  );
}

export function signOpenTableOAuthState(payload: { userId: string; connectionId: string }): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", stateSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyOpenTableOAuthState(
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

export function verifyOpenTableWebhookSignature(
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

export async function ensureOpenTableConnection(userId: string) {
  const where = await integrationConnectionByProviderWhereForOwner(
    userId,
    IntegrationProvider.OPENTABLE,
  );
  const existing = await prisma.integrationConnection.findFirst({ where });
  if (existing) return existing;
  return prisma.integrationConnection.create({
    data: {
      userId,
      provider: IntegrationProvider.OPENTABLE,
      name: "OpenTable",
      status: IntegrationStatus.NEEDS_AUTH,
      externalStoreId: process.env.OPENTABLE_RID?.trim() ?? null,
    },
  });
}

export function buildOpenTableOAuthAuthorizeUrl(input: {
  userId: string;
  connectionId: string;
}): string | null {
  const clientId = process.env.OPENTABLE_CLIENT_ID?.trim();
  if (!clientId) return null;

  const state = signOpenTableOAuthState(input);
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    scope: OAUTH_SCOPES,
    redirect_uri: oauthRedirectUri(),
    state,
  });
  return `${OAUTH_AUTHORIZE_URL}?${params.toString()}`;
}

export async function completeOpenTableOAuth(input: {
  userId: string;
  connectionId: string;
  code: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const conn = await prisma.integrationConnection.findFirst({
    where: {
      id: input.connectionId,
      userId: input.userId,
      provider: IntegrationProvider.OPENTABLE,
    },
  });
  if (!conn) return { ok: false, error: "Connection not found." };

  const clientId = process.env.OPENTABLE_CLIENT_ID?.trim();
  const clientSecret = process.env.OPENTABLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return { ok: false, error: "OPENTABLE_CLIENT_ID and OPENTABLE_CLIENT_SECRET are required." };
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
    return { ok: false, error: "OpenTable token response missing access_token." };
  }

  const settings = parseOpenTableSettings(conn.settingsJson);
  const webhookSecret = process.env.OPENTABLE_WEBHOOK_SECRET?.trim();

  await prisma.integrationConnection.update({
    where: { id: conn.id },
    data: {
      status: IntegrationStatus.CONNECTED,
      accessTokenEncrypted: encryptOptional(json.access_token.trim()),
      refreshTokenEncrypted: encryptOptional(json.refresh_token?.trim() ?? null),
      webhookSecretEncrypted: webhookSecret ? encryptOptional(webhookSecret) : conn.webhookSecretEncrypted,
      externalStoreId: conn.externalStoreId ?? process.env.OPENTABLE_RID?.trim() ?? null,
      settingsJson: settings,
      lastError: null,
    },
  });

  return { ok: true };
}

export function getOpenTableLiveMessage(
  hasClientId = Boolean(process.env.OPENTABLE_CLIENT_ID?.trim()),
): string {
  return hasClientId
    ? "OpenTable LIVE — OAuth, reservation webhooks, and table availability sync."
    : "Configure OPENTABLE_CLIENT_ID and OPENTABLE_CLIENT_SECRET to enable OpenTable LIVE.";
}

export async function getOpenTableLiveDashboard(userId: string): Promise<OpenTableLiveDashboard> {
  const conn = await ensureOpenTableConnection(userId);
  let settings = parseOpenTableSettings(conn.settingsJson);

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

  const creds = getOpenTableCredentials(conn);
  const hasClientId = Boolean(process.env.OPENTABLE_CLIENT_ID?.trim());
  const connected = Boolean(creds?.accessToken && creds.restaurantId);

  return {
    mode: hasClientId ? "live" : "placeholder",
    oauthAuthorizeUrl: hasClientId
      ? buildOpenTableOAuthAuthorizeUrl({ userId, connectionId: conn.id })
      : null,
    webhookUrl: `${SITE_URL}/api/webhooks/opentable/reservations?cid=${conn.id}`,
    connected,
    restaurantId: creds?.restaurantId ?? conn.externalStoreId ?? null,
    storefrontId: settings.storefrontId ?? null,
    lastWebhookAt: settings.lastWebhookAt ?? null,
    lastAvailabilitySyncAt: settings.lastAvailabilitySyncAt ?? null,
    availableSlots: settings.availableSlots ?? null,
    message: getOpenTableLiveMessage(hasClientId),
  };
}
