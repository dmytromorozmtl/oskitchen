import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import { logger } from "@/lib/logger";
import {
  applyHippocampalMeshToWetwareJson,
  isHippocampalOrganoidMeshEnabled,
  mergeHippocampalOrganoidMesh,
} from "@/lib/storefront/theme-experiment-hippocampal-organoid-mesh";
import { readCorticalOrganoidMesh } from "@/lib/storefront/theme-experiment-cortical-organoid-mesh";

export async function runHippocampalOrganoidMeshSyncCycle(): Promise<{ synced: number }> {
  if (!isHippocampalOrganoidMeshEnabled()) return { synced: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, themeExperimentJson: true },
    take: 40,
  });

  let synced = 0;
  for (const sf of storefronts) {
    const cort = readCorticalOrganoidMesh(sf.themeExperimentJson);
    if (!cort?.meshSynced) continue;

    const { json } = mergeHippocampalOrganoidMesh(sf.themeExperimentJson);
    const merged = applyHippocampalMeshToWetwareJson(json);

    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: merged as object },
    });
    synced++;
  }

  logger.info("hippocampal_organoid_mesh_sync_cycle", { synced });
  return { synced };
}
