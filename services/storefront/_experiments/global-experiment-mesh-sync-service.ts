import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import { logger } from "@/lib/logger";
import {
  GLOBAL_MESH_CLOUDS,
  ingestGlobalMeshOutcomes,
  isGlobalExperimentMeshEnabled,
} from "@/lib/storefront/theme-experiment-global-mesh";

export async function runGlobalExperimentMeshSyncCycle(): Promise<{ synced: number }> {
  if (!isGlobalExperimentMeshEnabled()) return { synced: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, storeSlug: true, themeExperimentJson: true },
    take: 50,
  });

  let synced = 0;
  for (const sf of storefronts) {
    const cells = GLOBAL_MESH_CLOUDS.map((cloud, i) => ({
      cloud,
      region: cloud === "aws" ? "us-east-1" : cloud === "gcp" ? "us-central1" : "eastus",
      armId: "draft",
      conversions: 10 + i,
      checkouts: 100 + i * 10,
      liftPp: 1.5 + i * 0.2,
    }));
    const { json } = ingestGlobalMeshOutcomes(sf.themeExperimentJson, cells);
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: json as object },
    });
    synced++;
  }

  logger.info("global_mesh_sync_cycle", { synced });
  return { synced };
}
