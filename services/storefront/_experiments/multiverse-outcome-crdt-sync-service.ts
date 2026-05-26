import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { publishMeshRelayEvent } from "@/lib/experiment-production/mesh-kafka-relay";
import {
  collapseMultiverseFromCosmicWeb,
  isMultiverseOutcomeCrdtEnabled,
} from "@/lib/storefront/theme-experiment-multiverse-outcome-crdt";
import { syncCosmicWebFromPeers } from "@/lib/storefront/theme-experiment-cosmic-web-federation";
import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson, toJsonValue } from "@/lib/prisma/json";

export async function runMultiverseOutcomeCrdtSyncCycle(): Promise<{ synced: number }> {
  if (!isMultiverseOutcomeCrdtEnabled()) return { synced: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, storeSlug: true, themeExperimentJson: true },
    take: 25,
  });

  let synced = 0;
  for (const sf of storefronts) {
    let json = coalesceThemeExperimentJson(sf.themeExperimentJson);
    json = toJsonValue(syncCosmicWebFromPeers(json, sf.storeSlug).json);
    const { json: merged, snap } = collapseMultiverseFromCosmicWeb(json);
    void publishMeshRelayEvent({
      at: new Date().toISOString(),
      storeSlug: sf.storeSlug,
      relayType: "cosmic_web",
      payload: {
        multiverse: true,
        collapsedArmId: snap.collapsedArmId,
        coherenceScore: snap.coherenceScore,
      },
    });
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: toInputJsonValue(merged) },
    });
    synced++;
  }

  logger.info("multiverse_outcome_crdt_sync_cycle", { synced });
  return { synced };
}
