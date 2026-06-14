import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import {
  readFeatureStoreHistory,
  trainMlRegretWeightsFromHistory,
  type FeatureStoreHistoryPoint,
} from "@/lib/storefront/theme-experiment-ml-model";
import type { ExperimentFeatureVector } from "@/lib/storefront/theme-experiment-ml-risk";

/** Nightly train logistic regret weights from feature store history (M5). */
export async function trainExperimentMlRegretModels(): Promise<{ trained: number }> {
  if (process.env.THEME_EXPERIMENT_ML_MODEL !== "1" && process.env.THEME_EXPERIMENT_ML_SHADOW !== "1") {
    return { trained: 0 };
  }

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, themeExperimentJson: true },
  });

  let trained = 0;
  for (const sf of storefronts) {
    const history = readFeatureStoreHistory(sf.themeExperimentJson);
    if (history.length < 5) continue;

    const weights = trainMlRegretWeightsFromHistory(history);
    const base =
      sf.themeExperimentJson && typeof sf.themeExperimentJson === "object" && !Array.isArray(sf.themeExperimentJson)
        ? { ...(sf.themeExperimentJson as Record<string, unknown>) }
        : {};
    base.mlRegretModel = weights;

    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: base as object },
    });
    trained++;
  }

  return { trained };
}

export function appendFeatureStoreHistoryPoint(
  raw: unknown,
  point: FeatureStoreHistoryPoint,
): Record<string, unknown> {
  const base =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? { ...(raw as Record<string, unknown>) }
      : {};
  const hist = readFeatureStoreHistory(raw);
  hist.push(point);
  base.featureStoreHistory = hist.slice(-90);
  return base;
}

export function featurePointOutcome(
  decision: string,
  blocked: boolean,
): FeatureStoreHistoryPoint["outcome"] {
  if (blocked) return "blocked";
  if (decision === "publish_draft") return "concluded";
  return "running";
}

export type { ExperimentFeatureVector };
