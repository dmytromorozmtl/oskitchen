import { PartnerAppInstallationStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getMergedPartnerOAuthAppByClientId } from "@/services/platform/partner-oauth-app-registry-service";

export type OutboundWebhookPartnerAttribution = {
  clientId: string;
  installationId: string;
};

/** Resolve partner install for webhook billing when subscription lacks explicit attribution. */
export async function resolveOutboundWebhookPartnerAttribution(input: {
  workspaceId: string | null;
  partnerClientId?: string | null;
  partnerInstallationId?: string | null;
}): Promise<OutboundWebhookPartnerAttribution | null> {
  if (input.partnerClientId?.trim() && input.partnerInstallationId?.trim()) {
    const install = await prisma.partnerAppInstallation.findFirst({
      where: {
        id: input.partnerInstallationId,
        clientId: input.partnerClientId,
        status: PartnerAppInstallationStatus.ACTIVE,
      },
      select: { id: true, clientId: true },
    });
    if (install) return { clientId: install.clientId, installationId: install.id };
  }

  if (!input.workspaceId) return null;

  const installs = await prisma.partnerAppInstallation.findMany({
    where: {
      workspaceId: input.workspaceId,
      status: PartnerAppInstallationStatus.ACTIVE,
    },
    select: { id: true, clientId: true, scopesGranted: true },
  });

  const webhookCapable: OutboundWebhookPartnerAttribution[] = [];
  for (const install of installs) {
    if (!install.scopesGranted.includes("manage:webhooks")) continue;
    const app = await getMergedPartnerOAuthAppByClientId(install.clientId);
    if (!app?.allowedScopes.includes("manage:webhooks")) continue;
    webhookCapable.push({ clientId: install.clientId, installationId: install.id });
  }

  if (webhookCapable.length !== 1) return null;
  return webhookCapable[0]!;
}

export async function resolveSingleWebhookCapablePartnerInstallForWorkspace(
  workspaceId: string | null,
): Promise<OutboundWebhookPartnerAttribution | null> {
  return resolveOutboundWebhookPartnerAttribution({ workspaceId });
}
