import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  isPrefrontalEthicsBoardEnabled,
  syncEthicsBoardFromPrefrontal,
} from "@/lib/storefront/theme-experiment-prefrontal-ethics-board";
import { mergePrefrontalOrganoidMesh } from "@/lib/storefront/theme-experiment-prefrontal-organoid-mesh";
import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson } from "@/lib/prisma/json";

export async function runPrefrontalEthicsBoardSyncCycle(): Promise<{ synced: number }> {
  if (!isPrefrontalEthicsBoardEnabled()) return { synced: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, themeExperimentJson: true },
    take: 100,
  });

  let synced = 0;
  for (const sf of storefronts) {
    let json = coalesceThemeExperimentJson(sf.themeExperimentJson);
    const pfc = mergePrefrontalOrganoidMesh(json);
    json = applyThemeExperimentPoll(json, () => ({ json: pfc.json }));
    const { json: withEthics } = syncEthicsBoardFromPrefrontal(json);
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: toInputJsonValue(withEthics) },
    });
    synced++;
  }

  logger.info("prefrontal_ethics_board_sync_cycle", { synced });
  return { synced };
}
