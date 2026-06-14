import { prisma } from "@/lib/prisma";
import { channelImportBatchListWhereForOwner } from "@/lib/scope/channel-import-scope";
import { channelSyncJobListWhereForOwner } from "@/lib/scope/workspace-channel-scope";

export async function getQueueAndSyncJobCounts(userId: string) {
  const [syncScope, importScope] = await Promise.all([
    channelSyncJobListWhereForOwner(userId),
    channelImportBatchListWhereForOwner(userId),
  ]);
  const [syncPending, syncRunning, syncFailed, importActive, importFailed] = await Promise.all([
    prisma.channelSyncJob.count({ where: { AND: [syncScope, { status: "PENDING" }] } }),
    prisma.channelSyncJob.count({ where: { AND: [syncScope, { status: "RUNNING" }] } }),
    prisma.channelSyncJob.count({ where: { AND: [syncScope, { status: "FAILED" }] } }),
    prisma.channelImportBatch.count({
      where: {
        AND: [
          importScope,
          { status: { in: ["VALIDATING", "NEEDS_REVIEW", "READY_TO_IMPORT", "PARTIAL"] } },
        ],
      },
    }),
    prisma.channelImportBatch.count({
      where: { AND: [importScope, { status: "FAILED" }] },
    }),
  ]);

  return {
    channelSync: {
      pending: syncPending,
      running: syncRunning,
      failed: syncFailed,
    },
    channelImport: {
      active: importActive,
      failed: importFailed,
    },
    queuedTotal: syncPending + importActive,
  };
}
