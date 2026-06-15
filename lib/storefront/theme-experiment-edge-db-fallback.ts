import { armWeightsRecord, readExperimentArms } from "@/lib/storefront/theme-experiment-multi-arm";
import { toJsonValue } from "@/lib/prisma/json";
import { isExperimentPipelineEnabledInJson } from "@/lib/storefront/theme-experiment-pipeline";
import { parseThemeExperimentConfig } from "@/lib/storefront/theme-experiment";
import type { ThemeExperimentEdgePayload } from "@/lib/storefront/theme-experiment-edge-config";
import { THEME_EXPERIMENT_ARMS } from "@/lib/storefront/theme-experiment-edge-config";
import { readSegmentArmWeights } from "@/lib/storefront/theme-experiment-contextual-bandit";
import { getThemeExperimentVersion } from "@/lib/storefront/theme-experiment-version";
import { prisma } from "@/lib/prisma";

/** Load themeExperimentJson for middleware QUBO / compositional paths (DB only when flag on). */
export async function readThemeExperimentJsonForStore(storeSlug: string): Promise<unknown | null> {
  const sf = await prisma.storefrontSettings.findFirst({
    where: { storeSlug },
    select: { themeExperimentJson: true },
  });
  return sf?.themeExperimentJson ?? null;
}

/** N3: when edge majority read is stale, derive assignment payload from DB. */
export async function readThemeExperimentDbFallbackPayload(
  storeSlug: string,
): Promise<ThemeExperimentEdgePayload | null> {
  const sf = await prisma.storefrontSettings.findFirst({
    where: { storeSlug },
    select: { id: true, themeExperimentJson: true },
  });
  if (!sf?.themeExperimentJson) return null;

  const config = parseThemeExperimentConfig(sf.themeExperimentJson);
  if (!config?.enabled || !isExperimentPipelineEnabledInJson(sf.themeExperimentJson)) return null;

  const arms = readExperimentArms(sf.themeExperimentJson);
  const version = getThemeExperimentVersion(sf.themeExperimentJson);

  return {
    experimentId: sf.id,
    enabled: true,
    pipelineEnabled: true,
    arms: THEME_EXPERIMENT_ARMS,
    armIds: arms.map((a) => a.id),
    armWeights: armWeightsRecord(arms),
    segmentArmWeights: readSegmentArmWeights(sf.themeExperimentJson),
    trafficPercent: config.trafficPercent ?? 50,
    publishedAt: new Date().toISOString(),
    version,
  };
}
