import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { publishMeshRelayEvent } from "@/lib/experiment-production/mesh-kafka-relay";
import { discoverWorkspaceStorefrontPeers } from "@/lib/experiment-production/workspace-peer-discovery";
import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson, toJsonValue } from "@/lib/prisma/json";
import {
  ingestCosmicFilamentCells,
  isCosmicWebFederationEnabled,
  syncCosmicWebFromPeers,
} from "@/lib/storefront/theme-experiment-cosmic-web-federation";

export async function runCosmicWebFederationSyncCycle(): Promise<{ synced: number }> {
  if (!isCosmicWebFederationEnabled()) return { synced: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, storeSlug: true, workspaceId: true, themeExperimentJson: true },
    take: 25,
  });

  let synced = 0;
  for (const sf of storefronts) {
    let json = coalesceThemeExperimentJson(sf.themeExperimentJson);
    const discovered = await discoverWorkspaceStorefrontPeers({
      workspaceId: sf.workspaceId,
      excludeStoreSlug: sf.storeSlug,
      limit: 10,
    });
    if (discovered.length > 0) {
      const cells = discovered.slice(0, 3).map((peer, i) => ({
        filament: (["perseus_pisces", "coma_virgo", "sculptor_wall"] as const)[i % 3]!,
        peerStoreSlug: peer.storeSlug,
        wormholeLatencyMs: 70 + i * 35,
        armId: "draft",
        liftPp: 1.9 + i * 0.2,
      }));
      json = toJsonValue(ingestCosmicFilamentCells(json, cells).json);
    }
    const { json: merged, snap } = syncCosmicWebFromPeers(json, sf.storeSlug);
    void publishMeshRelayEvent({
      at: new Date().toISOString(),
      storeSlug: sf.storeSlug,
      relayType: "cosmic_web",
      payload: {
        filamentQuorum: snap.filamentQuorum,
        wormholeSloMet: snap.wormholeSloMet,
        mergedLiftPp: snap.mergedLiftPp,
      },
    });
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: toInputJsonValue(merged) },
    });
    synced++;
  }

  logger.info("cosmic_web_federation_sync_cycle", { synced });
  return { synced };
}
