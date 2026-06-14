import type { IntegrationProvider } from "@prisma/client";

import { deriveWebhookPipelineStatus } from "@/lib/developer/webhook-status";
import { prisma } from "@/lib/prisma";
import { webhookEventListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export async function getWebhookMonitorSummary(userId: string) {
  const scope = await webhookEventListWhereForOwner(userId);
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [total24h, failed24h, pending] = await Promise.all([
    prisma.webhookEvent.count({ where: { AND: [scope, { receivedAt: { gte: since } }] } }),
    prisma.webhookEvent.count({
      where: {
        AND: [
          scope,
          { receivedAt: { gte: since }, processingError: { not: null } },
        ],
      },
    }),
    prisma.webhookEvent.count({ where: { AND: [scope, { processed: false }] } }),
  ]);

  const recent = await prisma.webhookEvent.findMany({
    where: scope,
    orderBy: { receivedAt: "desc" },
    take: 25,
    select: {
      id: true,
      provider: true,
      topic: true,
      processed: true,
      processingError: true,
      signatureValid: true,
      receivedAt: true,
      processedAt: true,
      connectionId: true,
    },
  });

  const rows = recent.map((r) => ({
    ...r,
    pipelineStatus: deriveWebhookPipelineStatus(r),
  }));

  return { total24h, failed24h, pending, recent: rows };
}

export async function getWebhookFailuresByProvider(
  userId: string,
): Promise<Partial<Record<IntegrationProvider, number>>> {
  const scope = await webhookEventListWhereForOwner(userId);
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const raw = await prisma.webhookEvent.groupBy({
    by: ["provider"],
    where: {
      AND: [
        scope,
        {
          receivedAt: { gte: since },
          OR: [{ processingError: { not: null } }, { signatureValid: false }],
        },
      ],
    },
    _count: { _all: true },
  });
  const out: Partial<Record<IntegrationProvider, number>> = {};
  for (const r of raw) {
    out[r.provider] = r._count._all;
  }
  return out;
}
