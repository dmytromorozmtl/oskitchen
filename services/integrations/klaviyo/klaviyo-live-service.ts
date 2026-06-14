import { IntegrationProvider, IntegrationStatus } from "@prisma/client";

import type { KlaviyoLiveConnectionSettings, KlaviyoLiveDashboard } from "@/lib/integrations/klaviyo-live-types";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { fetchKlaviyoSegments, verifyKlaviyoApiKey } from "@/services/integrations/klaviyo/klaviyo-api";
import {
  getKlaviyoCredentials,
  isKlaviyoApiKeyConfigured,
  parseKlaviyoSettings,
} from "@/services/integrations/klaviyo/klaviyo-credentials";
import { listEmailCampaignFlows } from "@/services/marketing/email-marketing-service";

export async function ensureKlaviyoConnection(userId: string) {
  const where = await integrationConnectionByProviderWhereForOwner(
    userId,
    IntegrationProvider.KLAVIYO,
  );
  const existing = await prisma.integrationConnection.findFirst({ where });
  if (existing) return existing;
  return prisma.integrationConnection.create({
    data: {
      userId,
      provider: IntegrationProvider.KLAVIYO,
      name: "Klaviyo",
      status: IntegrationStatus.NEEDS_AUTH,
    },
  });
}

export async function connectKlaviyoWithApiKey(
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.KLAVIYO_API_KEY?.trim();
  if (!apiKey) return { ok: false, error: "Set KLAVIYO_API_KEY" };

  const verified = await verifyKlaviyoApiKey(apiKey);
  if (!verified.ok) return verified;

  const conn = await ensureKlaviyoConnection(userId);
  await prisma.integrationConnection.update({
    where: { id: conn.id },
    data: {
      status: IntegrationStatus.CONNECTED,
      lastError: null,
    },
  });

  return { ok: true };
}

export function getKlaviyoLiveMessage(configured = isKlaviyoApiKeyConfigured()): string {
  return configured
    ? "Klaviyo LIVE — API key auth, campaign triggers, and segment export."
    : "Configure KLAVIYO_API_KEY to enable Klaviyo LIVE.";
}

export async function getKlaviyoLiveDashboard(userId: string): Promise<KlaviyoLiveDashboard> {
  const conn = await ensureKlaviyoConnection(userId);
  const creds = getKlaviyoCredentials(conn);
  const settings = parseKlaviyoSettings(conn.settingsJson);
  const configured = isKlaviyoApiKeyConfigured();
  const flows = await listEmailCampaignFlows();

  let connected = conn.status === IntegrationStatus.CONNECTED && configured;
  let segmentCount = 0;

  if (configured && creds?.apiKey) {
    const verified = await verifyKlaviyoApiKey(creds.apiKey);
    if (verified.ok) {
      connected = true;
      if (conn.status !== IntegrationStatus.CONNECTED) {
        await prisma.integrationConnection.update({
          where: { id: conn.id },
          data: { status: IntegrationStatus.CONNECTED, lastError: null },
        });
      }
      const segments = await fetchKlaviyoSegments(creds.apiKey);
      segmentCount = segments.length;
    }
  }

  return {
    mode: configured ? "live" : "placeholder",
    connected,
    segmentCount,
    campaignFlowCount: flows.length,
    lastProfileSyncAt: settings.lastProfileSyncAt ?? null,
    lastSegmentExportAt: settings.lastSegmentExportAt ?? null,
    lastSegmentExportCount: settings.lastSegmentExportCount ?? null,
    lastCampaignTriggerAt: settings.lastCampaignTriggerAt ?? null,
    lastCampaignTriggered: settings.lastCampaignTriggered ?? null,
    message: getKlaviyoLiveMessage(configured),
  };
}

export async function updateKlaviyoLiveSettings(
  userId: string,
  patch: Partial<KlaviyoLiveConnectionSettings>,
): Promise<void> {
  const conn = await ensureKlaviyoConnection(userId);
  const current = parseKlaviyoSettings(conn.settingsJson);
  const next: KlaviyoLiveConnectionSettings = { ...current, ...patch };
  await prisma.integrationConnection.update({
    where: { id: conn.id },
    data: { settingsJson: next },
  });
}
