import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson, toJsonValue } from "@/lib/prisma/json";
import {
  CISLUNAR_DTN_NODES,
  ingestCislunarBpv7Bundle,
  isCislunarDtnEnabled,
} from "@/lib/storefront/theme-experiment-cislunar-dtn";

export async function runCislunarDtnSyncCycle(): Promise<{ synced: number }> {
  if (!isCislunarDtnEnabled()) return { synced: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, themeExperimentJson: true },
    take: 30,
  });

  let synced = 0;
  for (const sf of storefronts) {
    let json = coalesceThemeExperimentJson(sf.themeExperimentJson);
    for (const sourceNode of CISLUNAR_DTN_NODES) {
      if (sourceNode === "earth") continue;
      const latencyMs =
        sourceNode === "leo"
          ? 420
          : sourceNode === "geo_relay"
            ? 1200
            : sourceNode === "lunar_relay"
              ? 2200
              : sourceNode === "mars_edge_prod"
                ? 95000
                : sourceNode === "mars_edge_sim"
                  ? 88000
                  : 500;
      const { json: merged } = ingestCislunarBpv7Bundle(json, {
        sourceNode,
        targetNode: "earth",
        latencyMs,
        cloud: "aws",
        region: sourceNode === "geo_relay" ? "geo-0" : "cislunar-1",
        armId: "draft",
        conversions: 9,
        checkouts: 90,
        liftPp: 1.4,
        delivered: latencyMs <= Number(process.env.THEME_EXPERIMENT_CISLUNAR_LATENCY_SLO_MS ?? "180000"),
      });
      json = toJsonValue(merged);
    }
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: toInputJsonValue(json) },
    });
    synced++;
  }

  logger.info("cislunar_dtn_sync_cycle", { synced });
  return { synced };
}
