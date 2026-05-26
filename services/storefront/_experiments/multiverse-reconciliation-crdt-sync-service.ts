import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  isMultiverseReconciliationCrdtEnabled,
  reconcileMultiverseFromParallelUniverses,
} from "@/lib/storefront/theme-experiment-multiverse-reconciliation-crdt";
import { mergeParallelUniversesFromCounterfactuals } from "@/lib/storefront/theme-experiment-parallel-universe-merge-crdt";
import { buildCounterfactualsFromOmniverse } from "@/lib/storefront/theme-experiment-multiverse-counterfactual-crdt";
import { buildOmniverseFromMultiverse } from "@/lib/storefront/theme-experiment-omniverse-causal-graph-crdt";
import { collapseMultiverseFromCosmicWeb } from "@/lib/storefront/theme-experiment-multiverse-outcome-crdt";
import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson, toJsonValue } from "@/lib/prisma/json";

export async function runMultiverseReconciliationCrdtSyncCycle(): Promise<{ synced: number }> {
  if (!isMultiverseReconciliationCrdtEnabled()) return { synced: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, themeExperimentJson: true },
    take: 100,
  });

  let synced = 0;
  for (const sf of storefronts) {
    let json = coalesceThemeExperimentJson(sf.themeExperimentJson);
    const mv = collapseMultiverseFromCosmicWeb(json);
    const om = buildOmniverseFromMultiverse(mv.json);
    const cf = buildCounterfactualsFromOmniverse(om.json);
    json = toJsonValue(mergeParallelUniversesFromCounterfactuals(cf.json).json);
    const merged = applyThemeExperimentPoll(json, reconcileMultiverseFromParallelUniverses);
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: toInputJsonValue(merged) },
    });
    synced++;
  }

  logger.info("multiverse_reconciliation_crdt_sync_cycle", { synced });
  return { synced };
}
