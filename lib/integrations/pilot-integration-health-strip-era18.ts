import type { UserRole } from "@prisma/client";

import { augmentPilotIntegrationHealthStripWithLiveProof } from "@/lib/integrations/pilot-integration-health-live-proof-era18";
import { augmentPilotIntegrationHealthStripWithBetaEnv } from "@/lib/integrations/pilot-integration-health-beta-env-era18";
import type { OperatorHomePersona } from "@/lib/navigation/operator-home-era18";
import { getServerEnv } from "@/lib/env";
import { hasPermission } from "@/lib/permissions/guards";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { prisma } from "@/lib/prisma";
import { getCachedWebhookEventListWhere } from "@/lib/scope/cached-workspace-resource-scope";
import {
  listChannelPilotLiveProofSlices,
  listIntegrationHealthCards,
  summarizeIntegrationHealth,
  type IntegrationHealthCard,
  type IntegrationHealthSummary,
} from "@/services/developer/integration-health-service";
import type { PilotIntegrationLiveProofRow } from "@/lib/integrations/pilot-integration-health-live-proof-era18";

export type PilotIntegrationHealthStripModel = {
  overall: IntegrationHealthSummary["overall"];
  headline: string;
  healthyCount: number;
  degradedCount: number;
  downCount: number;
  failedWebhookCount: number;
  connections: Array<{
    id: string;
    provider: string;
    name: string;
    status: string;
    lastSyncLabel: string;
    hasError: boolean;
  }>;
  liveProofRows: PilotIntegrationLiveProofRow[];
  hasLiveProofAttention: boolean;
};

export function formatPilotIntegrationLastSync(lastSyncAt: Date | null, now = Date.now()): string {
  if (!lastSyncAt) return "never synced";
  const diffMs = now - lastSyncAt.getTime();
  if (diffMs < 60_000) return "just now";
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function buildPilotIntegrationHealthStripModel(input: {
  summary: IntegrationHealthSummary;
  cards: readonly IntegrationHealthCard[];
  failedWebhookCount: number;
  now?: Date;
}): PilotIntegrationHealthStripModel {
  const now = input.now ?? new Date();
  const headline =
    input.summary.overall === "healthy"
      ? "Channels look healthy — review before pilot go-live."
      : input.summary.overall === "degraded"
        ? "Some integrations need attention before pilot traffic."
        : "Integration errors detected — fix before scaling pilot orders.";

  return {
    overall: input.summary.overall,
    headline,
    healthyCount: input.summary.healthyCount,
    degradedCount: input.summary.degradedCount,
    downCount: input.summary.downCount,
    failedWebhookCount: input.failedWebhookCount,
    connections: input.cards.slice(0, 3).map((card) => ({
      id: card.id,
      provider: card.provider,
      name: card.name,
      status: card.status,
      lastSyncLabel: formatPilotIntegrationLastSync(card.lastSyncAt, now.getTime()),
      hasError: Boolean(card.lastError?.trim()) || card.status === "ERROR",
    })),
    liveProofRows: [],
    hasLiveProofAttention: false,
  };
}

/** Owners, managers, and integration readers see the compact pilot health strip. */
export function shouldShowPilotIntegrationHealthStrip(input: {
  workspaceRole: UserRole;
  persona: OperatorHomePersona;
  granted: ReadonlySet<PermissionKey>;
}): boolean {
  if (input.workspaceRole === "OWNER") return true;
  if (input.persona === "manager") return true;
  return (
    hasPermission(input.granted, "integrations.read") ||
    hasPermission(input.granted, "integrations.manage")
  );
}

export async function loadPilotIntegrationHealthStripModelForWorkspace(
  dataUserId: string,
): Promise<PilotIntegrationHealthStripModel> {
  const env = getServerEnv();
  const webhookWhere = await getCachedWebhookEventListWhere();
  const [healthCards, failedWebhookCount, liveProofSlices] = await Promise.all([
    listIntegrationHealthCards(dataUserId),
    prisma.webhookEvent.count({
      where: { AND: [webhookWhere, { processed: false }] },
    }),
    listChannelPilotLiveProofSlices(dataUserId),
  ]);
  const stripeConfigured = Boolean(
    env.STRIPE_SECRET_KEY?.trim() && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim(),
  );
  const emailConfigured = Boolean(env.RESEND_API_KEY?.trim() && env.RESEND_FROM_EMAIL?.trim());
  const summary = summarizeIntegrationHealth(healthCards, {
    stripe: stripeConfigured,
    email: emailConfigured,
  });
  return augmentPilotIntegrationHealthStripWithBetaEnv(
    augmentPilotIntegrationHealthStripWithLiveProof(
      buildPilotIntegrationHealthStripModel({
        summary,
        cards: healthCards,
        failedWebhookCount,
      }),
      liveProofSlices,
    ),
  );
}
