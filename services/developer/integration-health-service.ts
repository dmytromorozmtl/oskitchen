import type { IntegrationProvider, IntegrationStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { integrationConnectionListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export type IntegrationHealthCard = {
  id: string;
  provider: IntegrationProvider;
  name: string;
  status: IntegrationStatus;
  lastSyncAt: Date | null;
  lastError: string | null;
  hasWebhookSecret: boolean;
};

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
