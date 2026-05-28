import { canUseFullSupportInbox } from "@/lib/support/support-permissions";
import {
  buildIntegrationHealthSupportAdminModel,
  resolveIntegrationHealthSupportAdminMode,
  resolveIntegrationHealthSupportAdminVisibility,
  type IntegrationHealthSupportAdminModel,
} from "@/lib/integrations/integration-health-support-admin-era19";
import { prisma } from "@/lib/prisma";
import { getCachedWebhookEventListWhere } from "@/lib/scope/cached-workspace-resource-scope";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import type { UserRole } from "@prisma/client";
import { loadCommercialPilotOpsStatusModel } from "@/services/commercial/commercial-pilot-ops-status-service";
import { listIntegrationHealthCards } from "@/services/developer/integration-health-service";
import { loadIntegrationHealthChannelCardsModel } from "@/services/integrations/integration-health-channel-cards-service";
import { loadIntegrationHealthSmokeArtifactsModel } from "@/services/integrations/integration-health-smoke-artifacts-service";

export type { IntegrationHealthSupportAdminModel };

export async function loadIntegrationHealthSupportAdminModel(input: {
  dataUserId: string;
  sessionUserId: string;
  email: string | null;
  workspaceRole: UserRole;
  platformBypass: boolean;
}): Promise<IntegrationHealthSupportAdminModel> {
  const canTriageSupport = await canUseFullSupportInbox(
    input.sessionUserId,
    input.email,
    input.workspaceRole,
  );
  const visible = resolveIntegrationHealthSupportAdminVisibility({
    platformBypass: input.platformBypass,
    canTriageSupport,
  });
  const mode = resolveIntegrationHealthSupportAdminMode({
    platformBypass: input.platformBypass,
  });

  const webhookWhere = await getCachedWebhookEventListWhere();

  const [workspaceId, kitchen, healthCards, channelCards, smokeArtifacts, commercialOps, failedWebhookCount] =
    await Promise.all([
      resolveOwnerWorkspaceId(input.dataUserId),
      prisma.kitchenSettings.findUnique({
        where: { userId: input.dataUserId },
        select: { businessName: true },
      }),
      listIntegrationHealthCards(input.dataUserId),
      loadIntegrationHealthChannelCardsModel(input.dataUserId),
      loadIntegrationHealthSmokeArtifactsModel(),
      loadCommercialPilotOpsStatusModel().catch(() => null),
      prisma.webhookEvent.count({
        where: { AND: [webhookWhere, { processed: false }] },
      }),
    ]);

  const errorConnectionCount = healthCards.filter((card) => card.status === "ERROR").length;

  return buildIntegrationHealthSupportAdminModel({
    visible,
    mode,
    workspaceId,
    businessName: kitchen?.businessName ?? null,
    connectionCount: healthCards.length,
    errorConnectionCount,
    failedWebhookCount,
    commercialOps,
    channelCards,
    smokeArtifacts,
  });
}
