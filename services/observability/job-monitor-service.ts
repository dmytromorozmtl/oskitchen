import {
  AutomationExecutionStatus,
  ChannelSyncJobStatus,
  ExportJobStatus,
  ImportStatus,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type JobQueueSnapshot = {
  channelSync: { pending: number; running: number; failed: number };
  exports: { failed: number; queuedOrRunning: number };
  imports: { failed: number };
  automations: { failedLast24h: number };
};

export async function getPlatformJobQueueSnapshot(): Promise<JobQueueSnapshot> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [
    syncPending,
    syncRunning,
    syncFailed,
    exportFailed,
    exportQueued,
    exportRunning,
    importFailed,
    autoFailed,
  ] = await Promise.all([
    prisma.channelSyncJob.count({ where: { status: ChannelSyncJobStatus.PENDING } }),
    prisma.channelSyncJob.count({ where: { status: ChannelSyncJobStatus.RUNNING } }),
    prisma.channelSyncJob.count({ where: { status: ChannelSyncJobStatus.FAILED } }),
    prisma.exportJob.count({ where: { status: ExportJobStatus.FAILED } }),
    prisma.exportJob.count({ where: { status: ExportJobStatus.QUEUED } }),
    prisma.exportJob.count({ where: { status: ExportJobStatus.RUNNING } }),
    prisma.importJob.count({ where: { status: ImportStatus.FAILED } }),
    prisma.automationExecution.count({
      where: { status: AutomationExecutionStatus.FAILED, startedAt: { gte: since } },
    }),
  ]);

  return {
    channelSync: {
      pending: syncPending,
      running: syncRunning,
      failed: syncFailed,
    },
    exports: {
      failed: exportFailed,
      queuedOrRunning: exportQueued + exportRunning,
    },
    imports: { failed: importFailed },
    automations: { failedLast24h: autoFailed },
  };
}
