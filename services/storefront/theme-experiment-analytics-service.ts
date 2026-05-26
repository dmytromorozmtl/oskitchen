import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import type { ThemeExperimentArm } from "@/lib/storefront/theme-experiment";
import { readExperimentArms } from "@/lib/storefront/theme-experiment-multi-arm";
import { parseExperimentArmId } from "@/lib/storefront/theme-experiment-analytics-core";
import {
  accumulateExperimentFunnelEvent,
  buildExperimentDateKeys,
  conversionRatePercent,
  emptyArmCounts,
  EXPERIMENT_FUNNEL_EVENT_NAMES,
  experimentDailyChartRowsFromBuckets,
  initExperimentDailyBuckets,
  parseExperimentArmFromMetadata,
  sumExperimentArmCounts,
  type ExperimentDailyChartRow,
} from "@/lib/storefront/theme-experiment-analytics-core";

export type ExperimentArmMetrics = {
  arm: ThemeExperimentArm | string;
  exposures: number;
  checkouts: number;
  conversions: number;
  conversionRatePercent: number;
};

export type { ExperimentDailyChartRow };

/** Daily funnel counts by arm (UTC buckets). */
export async function getThemeExperimentDailySeries(
  storefrontId: string,
  days = 30,
): Promise<ExperimentDailyChartRow[]> {
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (days - 1));

  const dateKeys = buildExperimentDateKeys(since, days);
  const buckets = initExperimentDailyBuckets(dateKeys);

  const events = await prisma.storefrontConversionEvent.findMany({
    where: {
      storefrontId,
      createdAt: { gte: since },
      eventName: { in: [...EXPERIMENT_FUNNEL_EVENT_NAMES] },
    },
    select: { eventName: true, metadataJson: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  for (const ev of events) {
    const arm = parseExperimentArmFromMetadata(ev.metadataJson);
    if (!arm) continue;
    const dateKey = ev.createdAt.toISOString().slice(0, 10);
    accumulateExperimentFunnelEvent(buckets, { dateKey, arm, eventName: ev.eventName });
  }

  return experimentDailyChartRowsFromBuckets(buckets);
}

/** Conversion by kos_ab_theme arm from first-party analytics metadata (last N days). */
export async function getThemeExperimentArmMetrics(
  storefrontId: string,
  days = 30,
  themeExperimentJson?: unknown,
): Promise<ExperimentArmMetrics[]> {
  const armDefs = readExperimentArms(themeExperimentJson);
  const armIds = armDefs.map((a) => a.id);

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);

  const events = await prisma.storefrontConversionEvent.findMany({
    where: {
      storefrontId,
      createdAt: { gte: since },
      eventName: { in: [...EXPERIMENT_FUNNEL_EVENT_NAMES] },
    },
    select: { eventName: true, metadataJson: true },
  });

  const counts: Record<string, ReturnType<typeof emptyArmCounts>> = {};
  for (const id of armIds) counts[id] = emptyArmCounts();

  for (const ev of events) {
    const armId = parseExperimentArmId(ev.metadataJson);
    if (!armId || !counts[armId]) continue;
    const row = counts[armId]!;
    if (ev.eventName === "experiment.exposure") row.exposures++;
    if (ev.eventName === "checkout_start") row.checkouts++;
    if (ev.eventName === "checkout_submit") row.conversions++;
  }

  return armIds.map((arm) => {
    const row = counts[arm] ?? emptyArmCounts();
    return {
      arm,
      ...row,
      conversionRatePercent: conversionRatePercent(row.checkouts, row.conversions),
    };
  });
}

/** Legacy helper — aggregate raw events when daily bucketing is not needed. */
export async function aggregateThemeExperimentArmMetricsFromEvents(
  events: { eventName: string; metadataJson: unknown }[],
): Promise<ExperimentArmMetrics[]> {
  const arms: Record<ThemeExperimentArm, ReturnType<typeof emptyArmCounts>> = {
    published: emptyArmCounts(),
    draft: emptyArmCounts(),
  };

  for (const ev of events) {
    const arm = parseExperimentArmFromMetadata(ev.metadataJson);
    if (!arm) continue;
    if (ev.eventName === "experiment.exposure") arms[arm].exposures++;
    if (ev.eventName === "checkout_start") arms[arm].checkouts++;
    if (ev.eventName === "checkout_submit") arms[arm].conversions++;
  }

  return (["published", "draft"] as const).map((arm) => {
    const row = arms[arm];
    return {
      arm,
      ...row,
      conversionRatePercent: conversionRatePercent(row.checkouts, row.conversions),
    };
  });
}
