import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { publishMeshRelayEvent } from "@/lib/experiment-production/mesh-kafka-relay";
import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson, toJsonValue } from "@/lib/prisma/json";
import {
  ingestIntergalacticFederationOutcomes,
  isIntergalacticMeshFederationEnabled,
  LANIAKEA_CLUSTERS,
} from "@/lib/storefront/theme-experiment-intergalactic-mesh-federation";

export async function runIntergalacticMeshFederationSyncCycle(): Promise<{ synced: number }> {
  if (!isIntergalacticMeshFederationEnabled()) return { synced: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, storeSlug: true, themeExperimentJson: true },
    take: 25,
  });

  let synced = 0;
  for (const sf of storefronts) {
    let json = coalesceThemeExperimentJson(sf.themeExperimentJson);
    for (const cluster of LANIAKEA_CLUSTERS) {
      const { json: merged } = ingestIntergalacticFederationOutcomes(json, [
        {
          cluster,
          relay: "andromeda_relay",
          cloud: "aws",
          region: cluster,
          armId: "draft",
          conversions: 6,
          checkouts: 60,
          liftPp: 2.4,
          wormholeLatencyMs: 120,
        },
      ]);
      json = toJsonValue(merged);
      void publishMeshRelayEvent({
        at: new Date().toISOString(),
        storeSlug: sf.storeSlug,
        relayType: "intergalactic",
        payload: { cluster, merged: true },
      });
    }
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: toInputJsonValue(json) },
    });
    synced++;
  }

  logger.info("intergalactic_mesh_federation_sync_cycle", { synced });
  return { synced };
}
