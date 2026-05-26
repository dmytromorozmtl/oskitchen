import type { ChannelSyncJobStatus, ChannelSyncJobType, IntegrationProvider } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";

export async function beginChannelSyncJob(input: {
  userId: string;
  connectionId: string | null;
  provider: IntegrationProvider;
  type: ChannelSyncJobType;
}) {
  const workspaceId = await resolveOwnerWorkspaceId(input.userId);
  return prisma.channelSyncJob.create({
    data: {
      userId: input.userId,
      workspaceId,
      connectionId: input.connectionId,
      provider: input.provider,
      type: input.type,
      status: "RUNNING",
    },
  });
}

export async function finishChannelSyncJob(
  jobId: string,
  outcome: {
    status: ChannelSyncJobStatus;
    recordsProcessed: number;
    recordsCreated: number;
    recordsUpdated: number;
    recordsFailed: number;
    errorMessage?: string | null;
  },
) {
  return prisma.channelSyncJob.update({
    where: { id: jobId },
    data: {
      status: outcome.status,
      completedAt: new Date(),
      recordsProcessed: outcome.recordsProcessed,
      recordsCreated: outcome.recordsCreated,
      recordsUpdated: outcome.recordsUpdated,
      recordsFailed: outcome.recordsFailed,
      errorMessage: outcome.errorMessage ?? null,
    },
  });
}
