import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  isPonsAutonomicBridgeFailoverEnabled,
  syncPonsFromMedullaAndSpinal,
} from "@/lib/storefront/theme-experiment-pons-autonomic-bridge-failover";
import { syncMedullaFromSpinalAndEthics } from "@/lib/storefront/theme-experiment-medulla-oblongata-emergency-halt";
import { syncSpinalThrottleFromBrainstem } from "@/lib/storefront/theme-experiment-spinal-cord-publish-throttle";
import { syncBrainstemFromCerebellar } from "@/lib/storefront/theme-experiment-brainstem-autonomic-guard";
import { syncCerebellarFromEthicsBoard } from "@/lib/storefront/theme-experiment-cerebellar-motor-organoid";
import { syncEthicsBoardFromPrefrontal } from "@/lib/storefront/theme-experiment-prefrontal-ethics-board";
import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson } from "@/lib/prisma/json";

export async function runPonsAutonomicBridgeFailoverSyncCycle(): Promise<{ synced: number }> {
  if (!isPonsAutonomicBridgeFailoverEnabled()) return { synced: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, themeExperimentJson: true },
    take: 100,
  });

  let synced = 0;
  for (const sf of storefronts) {
    let json = coalesceThemeExperimentJson(sf.themeExperimentJson);
    json = applyThemeExperimentPoll(json, syncEthicsBoardFromPrefrontal);
    json = applyThemeExperimentPoll(json, syncCerebellarFromEthicsBoard);
    json = applyThemeExperimentPoll(json, syncBrainstemFromCerebellar);
    json = applyThemeExperimentPoll(json, syncSpinalThrottleFromBrainstem);
    json = applyThemeExperimentPoll(json, syncMedullaFromSpinalAndEthics);
    const merged = applyThemeExperimentPoll(json, syncPonsFromMedullaAndSpinal);
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: toInputJsonValue(merged) },
    });
    synced++;
  }

  logger.info("pons_autonomic_bridge_failover_sync_cycle", { synced });
  return { synced };
}
