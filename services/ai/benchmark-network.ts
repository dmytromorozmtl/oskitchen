import type { Prisma } from "@prisma/client";

import { defaultFilters } from "@/lib/analytics/filters";
import { selectCohortForBusinessType, listBenchmarkCohorts } from "@/lib/ai/benchmark-cohort-seeds";
import { assembleBenchmarkNetworkResult } from "@/lib/ai/benchmark-network-builders";
import type { BenchmarkNetworkResult } from "@/lib/ai/benchmark-network-types";
import { buildWorkspaceMetricSnapshot } from "@/lib/ai/benchmark-workspace-metrics";
import { readBenchmarkSettings } from "@/lib/ai/benchmark-dashboard-storage";
import {
  buildAnonymizedContribution,
  computeNetworkStatus,
} from "@/lib/ai/benchmark-network-effects-builders";
import type {
  BenchmarkNetworkStatus,
  ContributionResult,
} from "@/lib/ai/benchmark-network-effects-types";
import { addToBenchmarkPool, readBenchmarkPool } from "@/lib/ai/benchmark-network-pool-storage";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId, resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import { analyzeFoodCost } from "@/services/ai/food-cost-ai";
import { getKDSPredictions } from "@/services/ai/real-time-twin";
import { loadExecutiveOverview } from "@/services/executive/executive-dashboard-service";
import { getLaborRealtimeData } from "@/services/labor/labor-realtime-load";

export type { BenchmarkNetworkResult, BenchmarkMetric, BenchmarkCohort } from "@/lib/ai/benchmark-network-types";
export type { BenchmarkNetworkStatus, ContributionResult } from "@/lib/ai/benchmark-network-effects-types";
export { listBenchmarkCohorts, selectCohortForBusinessType } from "@/lib/ai/benchmark-cohort-seeds";
export { gaugeToneForPercentile, BENCHMARK_METRIC_SPECS } from "@/lib/ai/benchmark-network-builders";

/**
 * Benchmark Network — compare workspace KPIs to anonymized industry cohorts.
 * 20+ metrics with percentile rank, quartile bands, and trend direction.
 * Deterministic engine; cohort baselines seed until live network pool grows.
 */
export async function getBenchmarkData(
  workspaceId: string,
  options?: { cohortId?: string },
): Promise<BenchmarkNetworkResult> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }

  const filters = defaultFilters();
  const windowDays = Math.max(
    1,
    Math.ceil((filters.to.getTime() - filters.from.getTime()) / 86_400_000),
  );

  const [kitchen, executive, foodCost, labor, kdsPredictions] = await Promise.all([
    prisma.kitchenSettings.findUnique({
      where: { userId: ownerUserId },
      select: { businessType: true },
    }),
    loadExecutiveOverview({ userId: ownerUserId }, filters).catch(() => null),
    analyzeFoodCost(workspaceId).catch(() => null),
    getLaborRealtimeData(ownerUserId).catch(() => null),
    getKDSPredictions(workspaceId).catch(() => null),
  ]);

  const cohort =
    (options?.cohortId
      ? listBenchmarkCohorts().find((c) => c.id === options.cohortId)
      : null) ?? selectCohortForBusinessType(kitchen?.businessType);

  const kdsWaitMinutes =
    kdsPredictions && kdsPredictions.stationPredictions.length > 0
      ? kdsPredictions.stationPredictions.reduce((s, p) => s + p.predictedWaitMinutes, 0) /
        kdsPredictions.stationPredictions.length
      : null;

  const snapshot = buildWorkspaceMetricSnapshot({
    windowDays,
    executive,
    foodCost,
    laborCostPercent: labor?.laborPercent ?? null,
    kdsWaitMinutes,
  });

  return assembleBenchmarkNetworkResult({
    workspaceId,
    cohort,
    snapshot,
  });
}

export async function getBenchmarkDataForUser(userId: string): Promise<BenchmarkNetworkResult> {
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  if (!workspaceId) throw new Error(`No workspace for user: ${userId}`);
  return getBenchmarkData(workspaceId);
}

async function loadWorkspaceBenchmarkSettings(ownerUserId: string) {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });
  return readBenchmarkSettings(kitchen?.settingsCenterJson ?? null);
}

async function persistWorkspaceContribution(
  ownerUserId: string,
  contribution: {
    contributing: boolean;
    lastContributedAt: string;
    metricsShared: number;
    anonId: string;
    cohortId: string;
  },
) {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });

  const existing = readBenchmarkSettings(kitchen?.settingsCenterJson ?? null);
  const center =
    kitchen?.settingsCenterJson && typeof kitchen.settingsCenterJson === "object" && !Array.isArray(kitchen.settingsCenterJson)
      ? { ...(kitchen.settingsCenterJson as Record<string, unknown>) }
      : {};

  await prisma.kitchenSettings.update({
    where: { userId: ownerUserId },
    data: {
      settingsCenterJson: {
        ...center,
        benchmarkNetwork: {
          ...existing,
          contribution: {
            ...existing.contribution,
            ...contribution,
          },
        },
      } as Prisma.InputJsonValue,
    },
  });
}

/**
 * Network status — seed cohort size + live anonymized contributors and impact score.
 */
export async function getNetworkStatus(workspaceId?: string): Promise<BenchmarkNetworkStatus> {
  const pool = await readBenchmarkPool();
  const seedCohorts = listBenchmarkCohorts();

  let workspaceContribution = null;
  if (workspaceId) {
    const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
    if (ownerUserId) {
      const settings = await loadWorkspaceBenchmarkSettings(ownerUserId);
      workspaceContribution = settings.contribution ?? null;
    }
  }

  return computeNetworkStatus({
    seedCohorts,
    pool,
    workspaceContribution,
  });
}

/**
 * Contribute anonymized benchmark metrics to the shared cohort pool.
 * No PII — values are bucketed; workspace is identified by one-way hash only.
 */
export async function contributeData(workspaceId: string): Promise<ContributionResult> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }

  const data = await getBenchmarkData(workspaceId);
  if (data.metrics.length < 5) {
    throw new Error("Not enough benchmark metrics to contribute. Complete more operational data first.");
  }

  const contribution = buildAnonymizedContribution({
    workspaceId,
    cohortId: data.cohort.id,
    businessType: data.cohort.businessType,
    region: data.cohort.region,
    metrics: data.metrics,
  });

  const pool = await addToBenchmarkPool(contribution);

  await persistWorkspaceContribution(ownerUserId, {
    contributing: true,
    lastContributedAt: contribution.contributedAt,
    metricsShared: contribution.metrics.length,
    anonId: contribution.anonId,
    cohortId: contribution.cohortId,
  });

  const networkStatus = computeNetworkStatus({
    seedCohorts: listBenchmarkCohorts(),
    pool,
    workspaceContribution: {
      contributing: true,
      lastContributedAt: contribution.contributedAt,
      metricsShared: contribution.metrics.length,
      anonId: contribution.anonId,
    },
  });

  return {
    success: true,
    anonId: contribution.anonId,
    metricsShared: contribution.metrics.length,
    cohortId: contribution.cohortId,
    contributedAt: contribution.contributedAt,
    networkStatus,
  };
}
