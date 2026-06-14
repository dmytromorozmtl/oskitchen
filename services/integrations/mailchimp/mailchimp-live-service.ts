import { createHmac, timingSafeEqual } from "crypto";

import { IntegrationProvider, IntegrationStatus } from "@prisma/client";

import { SITE_URL } from "@/lib/constants";
import { encryptOptional } from "@/lib/crypto";
import type { MailchimpLiveDashboard } from "@/lib/integrations/mailchimp-live-types";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import {
  fetchMailchimpAutomations,
  fetchMailchimpLists,
  fetchMailchimpOAuthMetadata,
} from "@/services/integrations/mailchimp/mailchimp-api";
import {
  getMailchimpCredentials,
  parseMailchimpSettings,
} from "@/services/integrations/mailchimp/mailchimp-credentials";

const OAUTH_AUTHORIZE_URL = "https://login.mailchimp.com/oauth2/authorize";
const OAUTH_TOKEN_URL = "https://login.mailchimp.com/oauth2/token";

function oauthRedirectUri(): string {
  return (
    process.env.MAILCHIMP_OAUTH_REDIRECT_URI?.trim() ??
    `${SITE_URL}/api/integrations/mailchimp/oauth/callback`
  );
}

function stateSecret(): string {
  return (
    process.env.MAILCHIMP_OAUTH_STATE_SECRET?.trim() ??
    process.env.ENCRYPTION_KEY?.trim() ??
    "mailchimp-live-state-dev"
  );
}

export function signMailchimpOAuthState(payload: { userId: string; connectionId: string }): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", stateSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyMailchimpOAuthState(
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

export async function ensureMailchimpConnection(userId: string) {
  const where = await integrationConnectionByProviderWhereForOwner(
    userId,
    IntegrationProvider.MAILCHIMP,
  );
  const existing = await prisma.integrationConnection.findFirst({ where });
  if (existing) return existing;
  return prisma.integrationConnection.create({
    data: {
      userId,
      provider: IntegrationProvider.MAILCHIMP,
      name: "Mailchimp",
      status: IntegrationStatus.NEEDS_AUTH,
      externalStoreId: process.env.MAILCHIMP_LIST_ID?.trim() ?? null,
    },
  });
}

export function buildMailchimpOAuthAuthorizeUrl(input: {
  userId: string;
  connectionId: string;
}): string | null {
  const clientId = process.env.MAILCHIMP_CLIENT_ID?.trim();
  if (!clientId) return null;

  const state = signMailchimpOAuthState(input);
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: oauthRedirectUri(),
    state,
  });
  return `${OAUTH_AUTHORIZE_URL}?${params.toString()}`;
}

export async function completeMailchimpOAuth(input: {
  userId: string;
  connectionId: string;
  code: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const conn = await prisma.integrationConnection.findFirst({
    where: {
      id: input.connectionId,
      userId: input.userId,
      provider: IntegrationProvider.MAILCHIMP,
    },
  });
  if (!conn) return { ok: false, error: "Connection not found." };

  const clientId = process.env.MAILCHIMP_CLIENT_ID?.trim();
  const clientSecret = process.env.MAILCHIMP_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return { ok: false, error: "MAILCHIMP_CLIENT_ID and MAILCHIMP_CLIENT_SECRET are required." };
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: oauthRedirectUri(),
    code: input.code,
  });

  const res = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, error: text.slice(0, 300) || `Token exchange failed (${res.status})` };
  }

  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token?.trim()) {
    return { ok: false, error: "Mailchimp token response missing access_token." };
  }

  const metadata = await fetchMailchimpOAuthMetadata(json.access_token.trim());
  if (!metadata.ok) return metadata;

  const settings = parseMailchimpSettings(conn.settingsJson);

  await prisma.integrationConnection.update({
    where: { id: conn.id },
    data: {
      status: IntegrationStatus.CONNECTED,
      accessTokenEncrypted: encryptOptional(json.access_token.trim()),
      externalStoreId:
        settings.selectedListId ??
        conn.externalStoreId ??
        process.env.MAILCHIMP_LIST_ID?.trim() ??
        null,
      settingsJson: {
        ...settings,
        datacenter: metadata.datacenter,
        apiEndpoint: metadata.apiEndpoint,
        accountName: metadata.accountName,
      },
      lastError: null,
    },
  });

  return { ok: true };
}

export function getMailchimpLiveMessage(
  hasClientId = Boolean(process.env.MAILCHIMP_CLIENT_ID?.trim()),
): string {
  return hasClientId
    ? "Mailchimp LIVE — OAuth, email list sync, and campaign automation."
    : "Configure MAILCHIMP_CLIENT_ID and MAILCHIMP_CLIENT_SECRET to enable Mailchimp LIVE.";
}

export async function getMailchimpLiveDashboard(userId: string): Promise<MailchimpLiveDashboard> {
  const conn = await ensureMailchimpConnection(userId);
  const creds = getMailchimpCredentials(conn);
  const settings = parseMailchimpSettings(conn.settingsJson);
  const hasClientId = Boolean(process.env.MAILCHIMP_CLIENT_ID?.trim());
  const connected = Boolean(creds?.accessToken && creds.apiEndpoint);

  let listCount = 0;
  let automationCount = 0;

  if (connected && creds) {
    const lists = await fetchMailchimpLists(creds.apiEndpoint, creds.accessToken);
    const automations = await fetchMailchimpAutomations(creds.apiEndpoint, creds.accessToken);
    listCount = lists.length;
    automationCount = automations.length;
  }

  return {
    mode: hasClientId ? "live" : "placeholder",
    oauthAuthorizeUrl: hasClientId
      ? buildMailchimpOAuthAuthorizeUrl({ userId, connectionId: conn.id })
      : null,
    connected,
    listCount,
    automationCount,
    listId: creds?.listId ?? conn.externalStoreId ?? null,
    lastListSyncAt: settings.lastListSyncAt ?? null,
    lastListSyncCount: settings.lastListSyncCount ?? null,
    lastAutomationTriggerAt: settings.lastAutomationTriggerAt ?? null,
    lastAutomationTriggered: settings.lastAutomationTriggered ?? null,
    message: getMailchimpLiveMessage(hasClientId),
  };
}

export async function updateMailchimpLiveSettings(
  userId: string,
  patch: Partial<import("@/lib/integrations/mailchimp-live-types").MailchimpLiveConnectionSettings>,
): Promise<void> {
  const conn = await ensureMailchimpConnection(userId);
  const current = parseMailchimpSettings(conn.settingsJson);
  const next = { ...current, ...patch };
  await prisma.integrationConnection.update({
    where: { id: conn.id },
    data: {
      settingsJson: next,
      externalStoreId: patch.selectedListId ?? conn.externalStoreId,
    },
  });
}
