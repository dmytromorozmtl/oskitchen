import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  isMultiverseCausalityLockCrdtEnabled,
  lockMultiverseCausalityFromFinality,
} from "@/lib/storefront/theme-experiment-multiverse-causality-lock-crdt";
import { sealMetaverseFinalityFromEpoch } from "@/lib/storefront/theme-experiment-metaverse-finality-seal-crdt";
import { sealOmniverseEpochFromReconciliation } from "@/lib/storefront/theme-experiment-omniverse-epoch-seal-crdt";
import { reconcileMultiverseFromParallelUniverses } from "@/lib/storefront/theme-experiment-multiverse-reconciliation-crdt";
import { mergeParallelUniversesFromCounterfactuals } from "@/lib/storefront/theme-experiment-parallel-universe-merge-crdt";
import { buildCounterfactualsFromOmniverse } from "@/lib/storefront/theme-experiment-multiverse-counterfactual-crdt";
import { buildOmniverseFromMultiverse } from "@/lib/storefront/theme-experiment-omniverse-causal-graph-crdt";
import { collapseMultiverseFromCosmicWeb } from "@/lib/storefront/theme-experiment-multiverse-outcome-crdt";
import { syncCosmicWebFromPeers } from "@/lib/storefront/theme-experiment-cosmic-web-federation";
import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson } from "@/lib/prisma/json";

export async function runMultiverseCausalityLockCrdtSyncCycle(): Promise<{ synced: number }> {
  if (!isMultiverseCausalityLockCrdtEnabled()) return { synced: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, storeSlug: true, themeExperimentJson: true },
    take: 100,
  });

  let synced = 0;
  for (const sf of storefronts) {
    let json = coalesceThemeExperimentJson(sf.themeExperimentJson);
    json = applyThemeExperimentPoll(json, (raw) => syncCosmicWebFromPeers(raw, sf.storeSlug));
    json = applyThemeExperimentPoll(json, collapseMultiverseFromCosmicWeb);
    json = applyThemeExperimentPoll(json, buildOmniverseFromMultiverse);
    json = applyThemeExperimentPoll(json, buildCounterfactualsFromOmniverse);
    json = applyThemeExperimentPoll(json, mergeParallelUniversesFromCounterfactuals);
    json = applyThemeExperimentPoll(json, reconcileMultiverseFromParallelUniverses);
    json = applyThemeExperimentPoll(json, sealOmniverseEpochFromReconciliation);
    json = applyThemeExperimentPoll(json, sealMetaverseFinalityFromEpoch);
    const merged = applyThemeExperimentPoll(json, lockMultiverseCausalityFromFinality);
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: toInputJsonValue(merged) },
    });
    synced++;
  }

  logger.info("multiverse_causality_lock_crdt_sync_cycle", { synced });
  return { synced };
}
