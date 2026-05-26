import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import { parseThemeExperimentConfig } from "@/lib/storefront/theme-experiment";
import {
  mergeChampionChallengerIntoJson,
  readMlChampionChallenger,
  recordMlShadowComparison,
  shouldAutoPromoteVertex,
} from "@/lib/storefront/theme-experiment-vertex-ml";
import { buildExperimentFeatureVector } from "@/lib/storefront/theme-experiment-ml-risk";
import { computeExperimentConcludeRiskScore } from "@/lib/storefront/theme-experiment-ml-risk";
import { evaluateExperimentProdDecision } from "@/lib/storefront/theme-experiment-decision";
import { evaluateExperimentSrm } from "@/lib/storefront/theme-experiment-srm";
import { getGa4ParityScoreForStorefront } from "@/services/storefront/ga4-parity-service";
import { getThemeExperimentArmMetrics } from "@/services/storefront/theme-experiment-analytics-service";
import { logger } from "@/lib/logger";

/** Daily shadow comparison + auto-promote vertex champion after 14 consecutive wins. */
export async function runExperimentVertexPromoteCycle(): Promise<{
  evaluated: number;
  promoted: number;
}> {
  if (process.env.THEME_EXPERIMENT_ML_SHADOW !== "1") {
    return { evaluated: 0, promoted: 0 };
  }

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: {
      id: true,
      storeSlug: true,
      themeExperimentJson: true,
      googleAnalyticsPropertyId: true,
    },
  });

  let evaluated = 0;
  let promoted = 0;

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
    const heuristic = computeExperimentConcludeRiskScore(features);
    const cc = recordMlShadowComparison({
      themeExperimentJson: sf.themeExperimentJson,
      features,
      heuristicBlocked: heuristic.blocked,
    });

    evaluated++;
    let merged = mergeChampionChallengerIntoJson(sf.themeExperimentJson, cc);

    if (shouldAutoPromoteVertex(cc)) {
      promoted++;
      logger.info("experiment_vertex_ml_auto_promote", {
        storeSlug: sf.storeSlug,
        consecutiveWins: cc.consecutiveWins,
      });
    }

    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: merged as object },
    });
  }

  return { evaluated, promoted };
}
