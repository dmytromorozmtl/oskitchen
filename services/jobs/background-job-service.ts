import { prisma } from "@/lib/prisma";
import {
  exportJobListWhereForOwner,
  importJobListWhereForOwner,
} from "@/lib/scope/workspace-import-export-scope";

export async function countRecentImportJobs(userId: string): Promise<number> {
  const scope = await importJobListWhereForOwner(userId);
  return prisma.importJob.count({
    where: { AND: [scope, { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }] },
  });
}

export async function countRecentExportJobs(userId: string): Promise<number> {
  const scope = await exportJobListWhereForOwner(userId);
  return prisma.exportJob.count({
    where: { AND: [scope, { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }] },
  });
}
