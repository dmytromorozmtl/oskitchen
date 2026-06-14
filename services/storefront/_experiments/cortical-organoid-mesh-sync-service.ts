import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import { logger } from "@/lib/logger";
import {
  applyCorticalMeshToWetwareJson,
  isCorticalOrganoidMeshEnabled,
  mergeCorticalOrganoidMesh,
} from "@/lib/storefront/theme-experiment-cortical-organoid-mesh";
import { discoverWorkspaceStorefrontPeers } from "@/lib/experiment-production/workspace-peer-discovery";
import { readWetwareCalibration } from "@/lib/storefront/theme-experiment-wetware-calibration";

export async function runCorticalOrganoidMeshSyncCycle(): Promise<{ synced: number }> {
  if (!isCorticalOrganoidMeshEnabled()) return { synced: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, storeSlug: true, workspaceId: true, themeExperimentJson: true },
    take: 40,
  });

  let synced = 0;
  for (const sf of storefronts) {
    const cal = readWetwareCalibration(sf.themeExperimentJson);
    if (!cal) continue;

    const discovered = await discoverWorkspaceStorefrontPeers({
      workspaceId: sf.workspaceId,
      excludeStoreSlug: sf.storeSlug,
    });
    const peers = discovered.map((p) => ({ storeSlug: p.storeSlug, synapses: p.synapses }));
    const { json } = mergeCorticalOrganoidMesh(sf.themeExperimentJson, sf.storeSlug, peers);
    const merged = applyCorticalMeshToWetwareJson(json);

    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: merged as object },
    });
    synced++;
  }

  logger.info("cortical_organoid_mesh_sync_cycle", { synced });
  return { synced };
}
