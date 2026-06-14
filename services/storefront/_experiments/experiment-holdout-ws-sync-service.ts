import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import { logger } from "@/lib/logger";
import { readPostWinnerHoldoutPercent } from "@/lib/storefront/theme-experiment-holdout";
import {
  applyHoldoutWsPush,
  isHoldoutWsEnabled,
  mergeHoldoutWsIntoJson,
} from "@/lib/storefront/theme-experiment-holdout-ws";

export async function runHoldoutWsSyncCycle(): Promise<{ synced: number }> {
  if (!isHoldoutWsEnabled()) return { synced: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, storeSlug: true, themeExperimentJson: true },
    take: 100,
  });

  let synced = 0;
  for (const sf of storefronts) {
    const holdout = readPostWinnerHoldoutPercent(sf.themeExperimentJson) ?? 5;
    const plane = applyHoldoutWsPush({
      previousRaw: sf.themeExperimentJson,
      holdoutPercent: holdout,
    });
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: mergeHoldoutWsIntoJson(sf.themeExperimentJson, plane) as object },
    });
    synced++;
  }

  logger.info("holdout_ws_sync_cycle", { synced });
  return { synced };
}
