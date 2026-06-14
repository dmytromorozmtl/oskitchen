import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson, toJsonValue } from "@/lib/prisma/json";
import {
  GALACTIC_RELAYS,
  ingestGalacticMeshOutcomes,
  isGalacticMeshEnabled,
} from "@/lib/storefront/theme-experiment-galactic-mesh";

export async function runGalacticMeshSyncCycle(): Promise<{ synced: number }> {
  if (!isGalacticMeshEnabled()) return { synced: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, themeExperimentJson: true },
    take: 25,
  });

  let synced = 0;
  for (const sf of storefronts) {
    let json = coalesceThemeExperimentJson(sf.themeExperimentJson);
    for (const relay of GALACTIC_RELAYS) {
      if (relay === "milky_way_hub") continue;
      const { json: merged } = ingestGalacticMeshOutcomes(json, [
        {
          relay,
          cloud: "aws",
          region: relay,
          armId: "draft",
          conversions: 12,
          checkouts: 120,
          liftPp: 2.2,
          latencyLy: relay === "andromeda_relay" ? 2.5 : 0.8,
        },
      ]);
      json = toJsonValue(merged);
    }
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: toInputJsonValue(json) },
    });
    synced++;
  }

  logger.info("galactic_mesh_sync_cycle", { synced });
  return { synced };
}
