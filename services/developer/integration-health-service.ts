import type { IntegrationProvider, IntegrationStatus } from "@prisma/client";

import { parseCertificationRecord } from "@/lib/integrations/channel-certification-types";
import {
  evaluateChannelLiveProofOperatorStatus,
  type ChannelPilotLiveProofSlice,
} from "@/lib/integrations/integration-health-live-proof-focus-era18";
import { evaluateChannelPilotSetupProgress } from "@/lib/integrations/channel-pilot-setup-wizard-steps";
import { prisma } from "@/lib/prisma";
import { integrationConnectionListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export type { ChannelPilotLiveProofSlice } from "@/lib/integrations/integration-health-live-proof-focus-era18";

export type IntegrationHealthCard = {
  id: string;
  provider: IntegrationProvider;
  name: string;
  status: IntegrationStatus;
  lastSyncAt: Date | null;
  lastError: string | null;
  hasWebhookSecret: boolean;
};

const PILOT_CHANNEL_PROVIDERS = ["WOOCOMMERCE", "SHOPIFY"] as const satisfies readonly IntegrationProvider[];

export type IntegrationHealthSummary = {
  overall: "healthy" | "degraded" | "down";
  healthyCount: number;
  degradedCount: number;
  downCount: number;
  stripeConfigured: boolean;
  emailConfigured: boolean;
};

export function summarizeIntegrationHealth(
  cards: IntegrationHealthCard[],
  env: { stripe: boolean; email: boolean },
): IntegrationHealthSummary {
  let healthyCount = 0;
  let degradedCount = 0;
  let downCount = 0;
  for (const c of cards) {
    if (c.status === "CONNECTED") healthyCount += 1;
    else if (c.status === "ERROR") downCount += 1;
    else degradedCount += 1;
  }
  if (!env.stripe || !env.email) degradedCount += 1;
  const overall = downCount > 0 || !env.stripe ? "down" : degradedCount > 0 ? "degraded" : "healthy";
  return {
    overall,
    healthyCount,
    degradedCount,
    downCount,
    stripeConfigured: env.stripe,
    emailConfigured: env.email,
  };
}

export async function listIntegrationHealthCards(userId: string): Promise<IntegrationHealthCard[]> {
  const scope = await integrationConnectionListWhereForOwner(userId);
  const rows = await prisma.integrationConnection.findMany({
    where: scope,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      provider: true,
      name: true,
      status: true,
      lastSyncAt: true,
      lastError: true,
      webhookSecretEncrypted: true,
    },
  });
  return rows.map((r) => ({
    id: r.id,
    provider: r.provider,
    name: r.name,
    status: r.status,
    lastSyncAt: r.lastSyncAt,
    lastError: r.lastError,
    hasWebhookSecret: Boolean(r.webhookSecretEncrypted),
  }));
}

function toIntegrationHealthCard(row: {
  id: string;
  provider: IntegrationProvider;
  name: string;
  status: IntegrationStatus;
  lastSyncAt: Date | null;
  lastError: string | null;
  webhookSecretEncrypted: string | null;
}): IntegrationHealthCard {
  return {
    id: row.id,
    provider: row.provider,
    name: row.name,
    status: row.status,
    lastSyncAt: row.lastSyncAt,
    lastError: row.lastError,
    hasWebhookSecret: Boolean(row.webhookSecretEncrypted),
  };
}

export async function listChannelPilotLiveProofSlices(
  userId: string,
): Promise<ChannelPilotLiveProofSlice[]> {
  const scope = await integrationConnectionListWhereForOwner(userId);
  const rows = await prisma.integrationConnection.findMany({
    where: {
      AND: [scope, { provider: { in: [...PILOT_CHANNEL_PROVIDERS] } }],
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      provider: true,
      name: true,
      status: true,
      lastSyncAt: true,
      lastError: true,
      webhookSecretEncrypted: true,
      consumerKeyEncrypted: true,
      consumerSecretEncrypted: true,
      accessTokenEncrypted: true,
      baseUrl: true,
      settingsJson: true,
    },
  });

  const byProvider = new Map<"WOOCOMMERCE" | "SHOPIFY", (typeof rows)[number]>();
  for (const row of rows) {
    if (row.provider !== "WOOCOMMERCE" && row.provider !== "SHOPIFY") continue;
    if (!byProvider.has(row.provider)) {
      byProvider.set(row.provider, row);
    }
  }

  return PILOT_CHANNEL_PROVIDERS.map((provider) => {
    const row = byProvider.get(provider) ?? null;
    const card = row ? toIntegrationHealthCard(row) : null;
    const pilotProvider = provider === "WOOCOMMERCE" ? "woocommerce" : "shopify";
    const hasSecrets =
      provider === "WOOCOMMERCE"
        ? Boolean(row?.consumerKeyEncrypted && row.consumerSecretEncrypted)
        : Boolean(row?.accessTokenEncrypted);
    const progress = evaluateChannelPilotSetupProgress({
      provider: pilotProvider,
      hasConnection: Boolean(row),
      hasCredentials: hasSecrets,
      hasWebhookSecret: Boolean(row?.webhookSecretEncrypted),
      hasStoreIdentity: Boolean(row?.baseUrl?.trim()),
      certification: parseCertificationRecord(row?.settingsJson),
    });
    const operatorStatus = evaluateChannelLiveProofOperatorStatus({ card, progress });

    return {
      provider,
      card,
      progress,
      operatorStatus,
    };
  });
}
