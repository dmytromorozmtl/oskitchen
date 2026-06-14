import { prisma } from "@/lib/prisma";
import {
  integrationConnectionListWhereForOwner,
  webhookEventListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import type { ResolvedChannel } from "@/lib/channels/channel-runtime";
import { resolveAllChannels } from "@/lib/channels/channel-runtime";
import { getServerEnv } from "@/lib/env";
import { infrastructureMaturityRows } from "@/lib/integrations/integration-maturity-matrix";
import type { InfrastructureIntegrationRow } from "@/lib/integrations/integration-maturity-matrix";
import { toSafeErrorPreview } from "@/lib/security/sensitive-redaction";
import { platformGetWorkspace } from "@/services/platform/platform-workspace-service";

export type PlatformWorkspaceWebhookDigest = {
  id: string;
  provider: string;
  topic: string;
  receivedAt: Date;
  signatureValid: boolean;
  /** Truncated + redacted; never raw DB text */
  processingErrorPreview: string | null;
  processingErrorRedacted: boolean;
};

export type PlatformWorkspaceIntegrationHealthView = {
  workspaceId: string;
  workspaceName: string;
  supportTicketCount: number;
  demoMode: boolean;
  connectionCount: number;
  resolved: ResolvedChannel[];
  infra: InfrastructureIntegrationRow[];
  unprocessedWebhooks: PlatformWorkspaceWebhookDigest[];
  pendingWebhookCount: number;
};

/**
 * Read-only integration posture for a workspace owner profile.
 * No credentials, secrets, or raw webhook bodies.
 */
export async function loadPlatformWorkspaceIntegrationHealth(
  workspaceId: string,
): Promise<PlatformWorkspaceIntegrationHealthView | null> {
  const ws = await platformGetWorkspace(workspaceId);
  if (!ws) return null;

  const ownerId = ws.ownerUserId;

  const [integrationScope, webhookScope] = await Promise.all([
    integrationConnectionListWhereForOwner(ownerId),
    webhookEventListWhereForOwner(ownerId),
  ]);
  const [connections, kitchen, unprocessedWebhooks, pendingWebhookCount] = await Promise.all([
    prisma.integrationConnection.findMany({
      where: integrationScope,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.kitchenSettings.findUnique({
      where: { userId: ownerId },
      select: { demoMode: true },
    }),
    prisma.webhookEvent.findMany({
      where: { AND: [webhookScope, { processed: false }] },
      orderBy: { receivedAt: "desc" },
      take: 20,
      select: {
        id: true,
        provider: true,
        topic: true,
        receivedAt: true,
        signatureValid: true,
        processingError: true,
      },
    }),
    prisma.webhookEvent.count({ where: { AND: [webhookScope, { processed: false }] } }),
  ]);

  const demoMode = kitchen?.demoMode ?? false;
  const resolved = resolveAllChannels(connections, demoMode);
  const env = getServerEnv();
  const infra = infrastructureMaturityRows(env);

  return {
    workspaceId: ws.id,
    workspaceName: ws.name,
    supportTicketCount: ws._count.supportTickets,
    demoMode,
    connectionCount: connections.length,
    resolved,
    infra,
    pendingWebhookCount,
    unprocessedWebhooks: unprocessedWebhooks.map((e) => {
      const p = toSafeErrorPreview(e.processingError, 160);
      return {
        id: e.id,
        provider: String(e.provider),
        topic: e.topic,
        receivedAt: e.receivedAt,
        signatureValid: e.signatureValid,
        processingErrorPreview: p.text === "—" ? null : p.text,
        processingErrorRedacted: p.redacted,
      };
    }),
  };
}
