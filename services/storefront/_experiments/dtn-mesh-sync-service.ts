import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson, toJsonValue } from "@/lib/prisma/json";
import {
  DTN_NODES,
  ingestDtnBundle,
  isDtnMeshEnabled,
} from "@/lib/storefront/theme-experiment-dtn-mesh";

export async function runDtnMeshSyncCycle(): Promise<{ synced: number }> {
  if (!isDtnMeshEnabled()) return { synced: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, themeExperimentJson: true },
    take: 30,
  });

  let synced = 0;
  for (const sf of storefronts) {
    let json = coalesceThemeExperimentJson(sf.themeExperimentJson);
    for (const sourceNode of DTN_NODES) {
      if (sourceNode === "earth") continue;
      const latencyMs =
        sourceNode === "leo" ? 450 : sourceNode === "lunar_relay" ? 2400 : 89000;
      const { json: merged } = ingestDtnBundle(json, {
        sourceNode,
        targetNode: "earth",
        latencyMs,
        cloud: "aws",
        region: sourceNode === "leo" ? "leo-1" : "dtn-edge",
        armId: "draft",
        conversions: 8,
        checkouts: 80,
        liftPp: 1.2,
        delivered: latencyMs <= Number(process.env.THEME_EXPERIMENT_DTN_MAX_LATENCY_MS ?? "120000"),
      });
      json = toJsonValue(merged);
    }
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: toInputJsonValue(json) },
    });
    synced++;
  }

  logger.info("dtn_mesh_sync_cycle", { synced });
  return { synced };
}
