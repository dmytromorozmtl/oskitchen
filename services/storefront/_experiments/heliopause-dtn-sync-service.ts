import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson, toJsonValue } from "@/lib/prisma/json";
import {
  HELIOPAUSE_NODES,
  ingestHeliopauseBundle,
  isHeliopauseDtnEnabled,
} from "@/lib/storefront/theme-experiment-heliopause-dtn";

export async function runHeliopauseDtnSyncCycle(): Promise<{ synced: number }> {
  if (!isHeliopauseDtnEnabled()) return { synced: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, themeExperimentJson: true },
    take: 25,
  });

  let synced = 0;
  for (const sf of storefronts) {
    let json = coalesceThemeExperimentJson(sf.themeExperimentJson);
    for (const sourceNode of HELIOPAUSE_NODES) {
      if (sourceNode === "earth") continue;
      const latencyMs =
        sourceNode === "heliopause_relay"
          ? 45_000_000
          : sourceNode === "oort_edge_sim"
            ? 120_000_000
            : 200_000_000;
      const { json: merged } = ingestHeliopauseBundle(json, {
        sourceNode,
        targetNode: "earth",
        latencyMs,
        cloud: "aws",
        region: sourceNode,
        armId: "draft",
        conversions: 6,
        checkouts: 60,
        liftPp: 1.1,
        storeAndForwardHops: 4,
        delivered: true,
      });
      json = toJsonValue(merged);
    }
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: toInputJsonValue(json) },
    });
    synced++;
  }

  logger.info("heliopause_dtn_sync_cycle", { synced });
  return { synced };
}
