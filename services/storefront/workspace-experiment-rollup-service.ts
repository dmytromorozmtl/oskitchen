import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import { parseThemeExperimentConfig } from "@/lib/storefront/theme-experiment";
import { evaluateExperimentProdDecision } from "@/lib/storefront/theme-experiment-decision";
import { evaluateExperimentSrm } from "@/lib/storefront/theme-experiment-srm";
import { getGa4ParityScoreForStorefront } from "@/services/storefront/ga4-parity-service";
import { getThemeExperimentArmMetrics } from "@/services/storefront/theme-experiment-analytics-service";
import { computeEdgeSyncSlo } from "@/services/storefront/storefront-edge-sync-slo-service";

export type WorkspaceExperimentRollupRow = {
  storeSlug: string;
  storefrontId: string;
  experimentEnabled: boolean;
  decision: string;
  liftPp: number;
  srmWarn: boolean;
  parityStatus: string;
  edgeSloOk: boolean;
};

export async function getWorkspaceExperimentRollup(
  workspaceId: string,
  days = 7,
): Promise<WorkspaceExperimentRollupRow[]> {
  const storefronts = await prisma.storefrontSettings.findMany({
    where: { workspaceId, enabled: true },
    select: {
      id: true,
      storeSlug: true,
      themeExperimentJson: true,
      googleAnalyticsPropertyId: true,
    },
  });

  const rows: WorkspaceExperimentRollupRow[] = [];

  for (const sf of storefronts) {
    const exp = parseThemeExperimentConfig(sf.themeExperimentJson);
    const armMetrics = await getThemeExperimentArmMetrics(sf.id, days);
    const decision = evaluateExperimentProdDecision(armMetrics, undefined, {
      themeExperimentJson: sf.themeExperimentJson,
    });
    const srm = evaluateExperimentSrm(armMetrics, exp?.trafficPercent ?? 50);
    const parity = await getGa4ParityScoreForStorefront({
      storefrontId: sf.id,
      themeExperimentJson: sf.themeExperimentJson,
      googleAnalyticsPropertyId: sf.googleAnalyticsPropertyId,
      days,
      refresh: false,
    });
    const edgeSlo = await computeEdgeSyncSlo({ storefrontId: sf.id });

    rows.push({
      storeSlug: sf.storeSlug,
      storefrontId: sf.id,
      experimentEnabled: exp?.enabled === true,
      decision: decision.recommendation,
      liftPp: decision.liftPp,
      srmWarn: srm.warn,
      parityStatus: parity.score.status,
      edgeSloOk: edgeSlo.sloMet,
    });
  }

  return rows.sort((a, b) => a.storeSlug.localeCompare(b.storeSlug));
}
