import type { Prisma } from "@prisma/client";

import { listBenchmarkCohorts } from "@/lib/ai/benchmark-cohort-seeds";
import {
  buildContributionInfo,
  buildOpportunities,
  buildRadarMetrics,
} from "@/lib/ai/benchmark-dashboard-builders";
import type { BenchmarkDashboardPayload } from "@/lib/ai/benchmark-dashboard-types";
import {
  mergeBenchmarkHistory,
  readBenchmarkSettings,
} from "@/lib/ai/benchmark-dashboard-storage";
import { prisma } from "@/lib/prisma";
import { resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import { getBenchmarkData, getNetworkStatus } from "@/services/ai/benchmark-network";

export type { BenchmarkDashboardPayload } from "@/lib/ai/benchmark-dashboard-types";

export async function loadBenchmarkDashboard(
  workspaceId: string,
  cohortId?: string,
): Promise<BenchmarkDashboardPayload> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }

  const data = await getBenchmarkData(workspaceId, cohortId ? { cohortId } : undefined);

  const revenueMetric = data.metrics.find((m) => m.key === "revenue_per_day");
  const ordersMetric = data.metrics.find((m) => m.key === "orders_per_day");
  const context = {
    revenuePerDay: revenueMetric?.yourValue ?? 1500,
    ordersPerDay: ordersMetric?.yourValue ?? 60,
  };

  const today = new Date().toISOString().slice(0, 10);
  const historyPoint = {
    date: today,
    averagePercentile: data.summary.averagePercentile,
    metricCount: data.summary.metricCount,
  };

  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });

  const existing = readBenchmarkSettings(kitchen?.settingsCenterJson ?? null);
  const mergedSettings = mergeBenchmarkHistory(existing, historyPoint);

  const center =
    kitchen?.settingsCenterJson && typeof kitchen.settingsCenterJson === "object" && !Array.isArray(kitchen.settingsCenterJson)
      ? { ...(kitchen.settingsCenterJson as Record<string, unknown>) }
      : {};

  await prisma.kitchenSettings.update({
    where: { userId: ownerUserId },
    data: {
      settingsCenterJson: {
        ...center,
        benchmarkNetwork: mergedSettings,
      } as Prisma.InputJsonValue,
    },
  });

  const cohortOptions = listBenchmarkCohorts().map((c) => ({
    id: c.id,
    label: c.label,
    sampleSize: c.sampleSize,
  }));

  const networkStatus = await getNetworkStatus(workspaceId);

  return {
    data,
    cohortOptions,
    selectedCohortId: data.cohort.id,
    radarMetrics: buildRadarMetrics(data.metrics),
    opportunities: buildOpportunities(data.metrics, context),
    history: mergedSettings.history ?? [historyPoint],
    contribution: buildContributionInfo({ networkStatus }),
  };
}
