import { prisma } from "@/lib/prisma";

export const EDGE_SYNC_SLO_P95_MS = 60_000;

export type EdgeSyncSloSnapshot = {
  p95Ms: number | null;
  sampleCount: number;
  sloMet: boolean;
  sloTargetMs: number;
  windowDays: number;
};

function percentile(sorted: number[], p: number): number | null {
  if (sorted.length === 0) return null;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(sorted.length - 1, idx))] ?? null;
}

/** SLO: edge sync job duration p95 < 60s (succeeded jobs, rolling window). */
export async function computeEdgeSyncSlo(input?: {
  storefrontId?: string;
  windowDays?: number;
}): Promise<EdgeSyncSloSnapshot> {
  const windowDays = input?.windowDays ?? 7;
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

  const jobs = await prisma.storefrontEdgeSyncJob.findMany({
    where: {
      kind: "theme_experiment",
      status: "SUCCEEDED",
      createdAt: { gte: since },
      ...(input?.storefrontId ? { storefrontId: input.storefrontId } : {}),
    },
    select: { createdAt: true, updatedAt: true },
    take: 500,
    orderBy: { createdAt: "desc" },
  });

  const durations = jobs
    .map((j) => j.updatedAt.getTime() - j.createdAt.getTime())
    .filter((ms) => ms >= 0)
    .sort((a, b) => a - b);

  const p95Ms = percentile(durations, 95);
  const sloMet = p95Ms === null ? true : p95Ms < EDGE_SYNC_SLO_P95_MS;

  return {
    p95Ms,
    sampleCount: durations.length,
    sloMet,
    sloTargetMs: EDGE_SYNC_SLO_P95_MS,
    windowDays,
  };
}
