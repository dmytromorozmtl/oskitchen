import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import { buildExperimentFeatureVector } from "@/lib/storefront/theme-experiment-ml-risk";
import {
  computeMlRiskWithVertex,
  mergeChampionChallengerIntoJson,
  recordMlShadowComparison,
} from "@/lib/storefront/theme-experiment-vertex-ml";
import { evaluateExperimentProdDecision } from "@/lib/storefront/theme-experiment-decision";
import {
  appendFeatureStoreHistoryPoint,
  featurePointOutcome,
  trainExperimentMlRegretModels,
} from "@/services/storefront/experiment-ml-train-service";
import { evaluateExperimentSrm } from "@/lib/storefront/theme-experiment-srm";
import { parseThemeExperimentConfig } from "@/lib/storefront/theme-experiment";
import { getGa4ParityScoreForStorefront } from "@/services/storefront/ga4-parity-service";
import { getThemeExperimentArmMetrics } from "@/services/storefront/theme-experiment-analytics-service";

export type ExperimentFeatureStoreRow = {
  storefrontId: string;
  storeSlug: string;
  at: string;
  features: ReturnType<typeof buildExperimentFeatureVector>;
  decision: string;
  liftPp: number;
};

/** Nightly feature vector materialization (BQ export can consume JSON log). */
export async function materializeExperimentFeatureStore(): Promise<{
  rows: ExperimentFeatureStoreRow[];
  mlModelsTrained: number;
}> {
  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: {
      id: true,
      storeSlug: true,
      themeExperimentJson: true,
      googleAnalyticsPropertyId: true,
    },
  });

  const rows: ExperimentFeatureStoreRow[] = [];
  const at = new Date().toISOString();

  for (const sf of storefronts) {
    const exp = parseThemeExperimentConfig(sf.themeExperimentJson);
    if (!exp?.enabled) continue;

    const armMetrics = await getThemeExperimentArmMetrics(sf.id, 7, sf.themeExperimentJson);
    const decision = evaluateExperimentProdDecision(armMetrics, undefined, {
      themeExperimentJson: sf.themeExperimentJson,
    });
    const srm = evaluateExperimentSrm(armMetrics, exp.trafficPercent ?? 50);
    const parity = await getGa4ParityScoreForStorefront({
      storefrontId: sf.id,
      themeExperimentJson: sf.themeExperimentJson,
      googleAnalyticsPropertyId: sf.googleAnalyticsPropertyId,
      days: 7,
      refresh: false,
    });

    const features = buildExperimentFeatureVector({
      decision,
      srm,
      parity: parity.score,
      edgeSynced: true,
    });

    const mlRisk = computeMlRiskWithVertex({
      features,
      themeExperimentJson: sf.themeExperimentJson,
    });

    rows.push({
      storefrontId: sf.id,
      storeSlug: sf.storeSlug,
      at,
      features,
      decision: decision.recommendation,
      liftPp: decision.liftPp,
    });

    let merged = appendFeatureStoreHistoryPoint(sf.themeExperimentJson, {
      at,
      features,
      outcome: featurePointOutcome(decision.recommendation, mlRisk.blocked),
    });

    const cc = recordMlShadowComparison({
      themeExperimentJson: merged,
      features,
      heuristicBlocked: mlRisk.blocked,
    });
    merged = mergeChampionChallengerIntoJson(merged, cc);

    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: merged as object },
    });
  }

  const { trained } = await trainExperimentMlRegretModels();

  return { rows, mlModelsTrained: trained };
}
