import { prisma } from "@/lib/prisma";
import {
  exportJobListWhereForOwner,
  importJobListWhereForOwner,
} from "@/lib/scope/workspace-import-export-scope";

export async function getBackgroundJobSnapshot(userId: string) {
  const [importScope, exportScope] = await Promise.all([
    importJobListWhereForOwner(userId),
    exportJobListWhereForOwner(userId),
  ]);
  const [importQueued, importFailed, exportQueued, exportFailed] = await Promise.all([
    prisma.importJob.count({
      where: { AND: [importScope, { status: { in: ["UPLOADED", "MAPPING", "VALIDATED"] } }] },
    }),
    prisma.importJob.count({
      where: { AND: [importScope, { status: "FAILED" }] },
    }),
    prisma.exportJob.count({
      where: { AND: [exportScope, { status: { in: ["QUEUED", "RUNNING"] } }] },
    }),
    prisma.exportJob.count({
      where: { AND: [exportScope, { status: "FAILED" }] },
    }),
  ]);

  return {
    importCenter: { queued: importQueued, failed: importFailed },
    exports: { queued: exportQueued, failed: exportFailed },
  };
}
