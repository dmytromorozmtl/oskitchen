import { prisma } from "@/lib/prisma";

export type EdgeSyncJobHistoryRow = {
  id: string;
  status: string;
  attemptCount: number;
  maxAttempts: number;
  expectedVersion: number;
  lastError: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function listRecentThemeExperimentEdgeSyncJobs(
  storefrontId: string,
  limit = 10,
): Promise<EdgeSyncJobHistoryRow[]> {
  const jobs = await prisma.storefrontEdgeSyncJob.findMany({
    where: { storefrontId, kind: "theme_experiment" },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      status: true,
      attemptCount: true,
      maxAttempts: true,
      expectedVersion: true,
      lastError: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return jobs;
}
