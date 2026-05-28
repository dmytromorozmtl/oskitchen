import { getWorkspaceSsoAdminView } from "@/lib/enterprise/workspace-sso-admin-service";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { ChannelLiveSmokeSummary } from "@/lib/integrations/channel-live-smoke-summary";
import {
  buildIntegrationHealthChannelCardsModel,
  listStripeMissingEnvVars,
} from "@/lib/integrations/integration-health-channel-cards-era19";
import { enrichIntegrationHealthChannelCardsWithTrustLayer } from "@/lib/integrations/integration-health-trust-layer-era20";
import type { IntegrationHealthChannelCardsModel } from "@/lib/integrations/integration-health-channel-cards-era19";
import type { IntegrationHealthTrustLayerSlice } from "@/lib/integrations/integration-health-trust-layer-era20";
import { INTEGRATION_HEALTH_SMOKE_ARTIFACT_PATHS } from "@/lib/integrations/integration-health-smoke-artifacts-era19-policy";
import { getServerEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { getCachedWebhookEventListWhere } from "@/lib/scope/cached-workspace-resource-scope";
import {
  listChannelPilotLiveProofSlices,
  listIntegrationHealthCards,
} from "@/services/developer/integration-health-service";
import { countActiveApiKeys } from "@/services/developer/api-key-service";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

function readJsonArtifact<T>(relativePath: string): T | null {
  try {
    const absolutePath = join(process.cwd(), relativePath);
    if (!existsSync(absolutePath)) return null;
    return JSON.parse(readFileSync(absolutePath, "utf8")) as T;
  } catch {
    return null;
  }
}

export type IntegrationHealthChannelCardsViewModel = IntegrationHealthChannelCardsModel &
  IntegrationHealthTrustLayerSlice;

export async function loadIntegrationHealthChannelCardsModel(
  userId: string,
): Promise<IntegrationHealthChannelCardsViewModel> {
  const env = getServerEnv();
  const webhookWhere = await getCachedWebhookEventListWhere();
  const workspaceId = await resolveOwnerWorkspaceId(userId);

  const [
    healthCards,
    liveProofSlices,
    failedWebhookCount,
    apiKeysActive,
    channelSmoke,
    p0Staging,
    ssoView,
  ] = await Promise.all([
    listIntegrationHealthCards(userId),
    listChannelPilotLiveProofSlices(userId),
    prisma.webhookEvent.count({
      where: { AND: [webhookWhere, { processed: false }] },
    }),
    countActiveApiKeys(userId),
    Promise.resolve(
      readJsonArtifact<ChannelLiveSmokeSummary>(
        INTEGRATION_HEALTH_SMOKE_ARTIFACT_PATHS.channelLive,
      ),
    ),
    Promise.resolve(
      readJsonArtifact<P0StagingProofUnblockSummary>(
        INTEGRATION_HEALTH_SMOKE_ARTIFACT_PATHS.p0Staging,
      ),
    ),
    workspaceId
      ? getWorkspaceSsoAdminView({ workspaceId, ownerUserId: userId })
      : Promise.resolve(null),
  ]);

  const stripeMissingEnvVars = listStripeMissingEnvVars({
    secretKey: env.STRIPE_SECRET_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  });

  const base = buildIntegrationHealthChannelCardsModel({
    stripeConfigured: stripeMissingEnvVars.length === 0,
    stripeMissingEnvVars,
    failedWebhookCount,
    apiKeysActive,
    channelSmoke,
    p0Staging,
    cards: healthCards,
    liveProofSlices,
    sso: ssoView
      ? {
          entitlementEnabled: ssoView.ssoEntitlementEnabled,
          configured: ssoView.configured,
          active: ssoView.active,
        }
      : null,
  });

  return enrichIntegrationHealthChannelCardsWithTrustLayer(base, p0Staging);
}
