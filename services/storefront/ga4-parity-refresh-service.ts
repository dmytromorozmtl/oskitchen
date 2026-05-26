import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import {
  GA4_PARITY_DRIFT_STREAK_ALERT,
  mergeGa4ParityIntoJson,
  nextGa4ParityDriftStreak,
  readGa4ParityDriftStreak,
  readGa4ParityHistory,
  type Ga4ParityHistoryPoint,
} from "@/lib/storefront/ga4-parity-json";
import { computeGa4ParityScore, type Ga4ParityScore } from "@/lib/storefront/ga4-parity-score";
import { resolveGa4ParityInput } from "@/lib/storefront/ga4-parity-source";
import { isGa4DataApiConfigured } from "@/lib/storefront/ga4-data-api";
import { evaluateExperimentProdDecision } from "@/lib/storefront/theme-experiment-decision";
import { getThemeExperimentArmMetrics } from "@/services/storefront/theme-experiment-analytics-service";

export type Ga4ParityRefreshResult = {
  score: Ga4ParityScore;
  history: Ga4ParityHistoryPoint[];
  driftStreakCount: number;
  shouldAlertDrift: boolean;
  refreshedGa4: boolean;
};

export async function refreshGa4ParityForStorefront(input: {
  storefrontId: string;
  themeExperimentJson: unknown;
  googleAnalyticsPropertyId: string | null;
  days: number;
  force?: boolean;
  recordHistory?: boolean;
  updateDriftStreak?: boolean;
}): Promise<Ga4ParityRefreshResult> {
  const propertyId = input.googleAnalyticsPropertyId?.trim() || null;
  const armMetrics = await getThemeExperimentArmMetrics(input.storefrontId, input.days);
  const decision = evaluateExperimentProdDecision(armMetrics);

  const resolved = await resolveGa4ParityInput({
    themeExperimentJson: input.themeExperimentJson,
    propertyId,
    days: input.days,
    force: input.force,
  });

  const score = computeGa4ParityScore({
    decision,
    ga4: resolved.ga4,
    propertyId,
    dataApiConfigured: isGa4DataApiConfigured(),
    cachedAt: resolved.cachedAt,
    bqSnapshot: resolved.bqSnapshot,
    dataSource: resolved.source,
  });

  const historyPoint: Ga4ParityHistoryPoint = {
    at: new Date().toISOString(),
    status: score.status,
    parityScorePp: score.parityScorePp,
    firstPartyLiftPp: score.firstPartyLiftPp,
    ga4LiftPp: score.ga4LiftPp,
  };

  const prevStreak = readGa4ParityDriftStreak(input.themeExperimentJson);
  const driftStreak =
    input.updateDriftStreak !== false
      ? nextGa4ParityDriftStreak(prevStreak, score)
      : (prevStreak ?? {
          count: 0,
          lastAt: new Date().toISOString(),
          lastParityPp: score.parityScorePp,
        });
  const shouldAlertDrift =
    input.updateDriftStreak !== false &&
    score.status === "drift" &&
    driftStreak.count >= GA4_PARITY_DRIFT_STREAK_ALERT;

  const needsPersist =
    resolved.refreshed || input.recordHistory || input.updateDriftStreak !== false;

  let mergedJson = input.themeExperimentJson;
  if (needsPersist) {
    const merged = mergeGa4ParityIntoJson(input.themeExperimentJson, {
      ga4: resolved.refreshed ? resolved.ga4 : null,
      historyPoint: input.recordHistory ? historyPoint : undefined,
      driftStreak: input.updateDriftStreak !== false ? driftStreak : undefined,
    });
    await prisma.storefrontSettings.update({
      where: { id: input.storefrontId },
      data: { themeExperimentJson: merged as object },
    });
    mergedJson = merged;
  }

  return {
    score,
    history: readGa4ParityHistory(mergedJson),
    driftStreakCount: driftStreak.count,
    shouldAlertDrift,
    refreshedGa4: resolved.refreshed,
  };
}
