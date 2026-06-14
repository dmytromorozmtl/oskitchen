import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { publishMeshRelayEvent } from "@/lib/experiment-production/mesh-kafka-relay";
import {
  buildCounterfactualsFromOmniverse,
  isMultiverseCounterfactualCrdtEnabled,
} from "@/lib/storefront/theme-experiment-multiverse-counterfactual-crdt";
import { buildOmniverseFromMultiverse } from "@/lib/storefront/theme-experiment-omniverse-causal-graph-crdt";
import { collapseMultiverseFromCosmicWeb } from "@/lib/storefront/theme-experiment-multiverse-outcome-crdt";
import { syncCosmicWebFromPeers } from "@/lib/storefront/theme-experiment-cosmic-web-federation";
import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson, toJsonValue } from "@/lib/prisma/json";

export async function runMultiverseCounterfactualCrdtSyncCycle(): Promise<{ synced: number }> {
  if (!isMultiverseCounterfactualCrdtEnabled()) return { synced: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, storeSlug: true, themeExperimentJson: true },
    take: 25,
  });

  let synced = 0;
  for (const sf of storefronts) {
    let json = coalesceThemeExperimentJson(sf.themeExperimentJson);
    json = toJsonValue(syncCosmicWebFromPeers(json, sf.storeSlug).json);
    json = applyThemeExperimentPoll(json, collapseMultiverseFromCosmicWeb);
    json = applyThemeExperimentPoll(json, buildOmniverseFromMultiverse);
    const { json: merged, snap } = buildCounterfactualsFromOmniverse(json);

    void publishMeshRelayEvent({
      at: new Date().toISOString(),
      storeSlug: sf.storeSlug,
      relayType: "cosmic_web",
      payload: {
        counterfactual: true,
        branchQuorum: snap.branchQuorum,
        whatIfLiftPp: snap.mergedWhatIfLiftPp,
      },
    });

    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: toInputJsonValue(merged) },
    });
    synced++;
  }

  logger.info("multiverse_counterfactual_crdt_sync_cycle", { synced });
  return { synced };
}
