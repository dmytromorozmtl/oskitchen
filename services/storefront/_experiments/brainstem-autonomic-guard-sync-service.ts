import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  isBrainstemAutonomicGuardEnabled,
  syncBrainstemFromCerebellar,
} from "@/lib/storefront/theme-experiment-brainstem-autonomic-guard";
import { syncCerebellarFromEthicsBoard } from "@/lib/storefront/theme-experiment-cerebellar-motor-organoid";
import { syncEthicsBoardFromPrefrontal } from "@/lib/storefront/theme-experiment-prefrontal-ethics-board";
import { mergePrefrontalOrganoidMesh } from "@/lib/storefront/theme-experiment-prefrontal-organoid-mesh";
import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson } from "@/lib/prisma/json";

export async function runBrainstemAutonomicGuardSyncCycle(): Promise<{ synced: number }> {
  if (!isBrainstemAutonomicGuardEnabled()) return { synced: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, themeExperimentJson: true },
    take: 100,
  });

  let synced = 0;
  for (const sf of storefronts) {
    let json = coalesceThemeExperimentJson(sf.themeExperimentJson);
    json = applyThemeExperimentPoll(json, mergePrefrontalOrganoidMesh);
    json = applyThemeExperimentPoll(json, syncEthicsBoardFromPrefrontal);
    json = applyThemeExperimentPoll(json, syncCerebellarFromEthicsBoard);
    const merged = applyThemeExperimentPoll(json, syncBrainstemFromCerebellar);
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: toInputJsonValue(merged) },
    });
    synced++;
  }

  logger.info("brainstem_autonomic_guard_sync_cycle", { synced });
  return { synced };
}
