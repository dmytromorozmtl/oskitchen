import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import { logger } from "@/lib/logger";
import {
  applyPrefrontalMeshToWetwareJson,
  isPrefrontalOrganoidMeshEnabled,
  mergePrefrontalOrganoidMesh,
} from "@/lib/storefront/theme-experiment-prefrontal-organoid-mesh";
import { readHippocampalOrganoidMesh } from "@/lib/storefront/theme-experiment-hippocampal-organoid-mesh";

export async function runPrefrontalOrganoidMeshSyncCycle(): Promise<{ synced: number }> {
  if (!isPrefrontalOrganoidMeshEnabled()) return { synced: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, themeExperimentJson: true },
    take: 40,
  });

  let synced = 0;
  for (const sf of storefronts) {
    const hippo = readHippocampalOrganoidMesh(sf.themeExperimentJson);
    if (!hippo?.hippocampalSynced) continue;

    const { json } = mergePrefrontalOrganoidMesh(sf.themeExperimentJson);
    const merged = applyPrefrontalMeshToWetwareJson(json);

    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: merged as object },
    });
    synced++;
  }

  logger.info("prefrontal_organoid_mesh_sync_cycle", { synced });
  return { synced };
}
