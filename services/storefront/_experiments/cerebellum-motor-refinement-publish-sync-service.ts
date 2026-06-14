import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  isCerebellumMotorRefinementPublishEnabled,
  syncCerebellumFromBasalGangliaAndMidbrain,
} from "@/lib/storefront/theme-experiment-cerebellum-motor-refinement-publish";
import { syncBasalGangliaFromThalamusAndMidbrain } from "@/lib/storefront/theme-experiment-basal-ganglia-action-selection-publish";
import { syncThalamusFromMidbrainAndSpinal } from "@/lib/storefront/theme-experiment-thalamus-sensory-gating-publish";
import { syncMidbrainFromPonsAndSpinal } from "@/lib/storefront/theme-experiment-midbrain-arousal-publish-pacing";
import { syncPonsFromMedullaAndSpinal } from "@/lib/storefront/theme-experiment-pons-autonomic-bridge-failover";
import { syncMedullaFromSpinalAndEthics } from "@/lib/storefront/theme-experiment-medulla-oblongata-emergency-halt";
import { syncSpinalThrottleFromBrainstem } from "@/lib/storefront/theme-experiment-spinal-cord-publish-throttle";
import { syncBrainstemFromCerebellar } from "@/lib/storefront/theme-experiment-brainstem-autonomic-guard";
import { syncCerebellarFromEthicsBoard } from "@/lib/storefront/theme-experiment-cerebellar-motor-organoid";
import { syncEthicsBoardFromPrefrontal } from "@/lib/storefront/theme-experiment-prefrontal-ethics-board";
import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson } from "@/lib/prisma/json";

export async function runCerebellumMotorRefinementPublishSyncCycle(): Promise<{ synced: number }> {
  if (!isCerebellumMotorRefinementPublishEnabled()) return { synced: 0 };

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
    json = applyThemeExperimentPoll(json, syncPonsFromMedullaAndSpinal);
    json = applyThemeExperimentPoll(json, syncMidbrainFromPonsAndSpinal);
    json = applyThemeExperimentPoll(json, syncThalamusFromMidbrainAndSpinal);
    json = applyThemeExperimentPoll(json, syncBasalGangliaFromThalamusAndMidbrain);
    const merged = applyThemeExperimentPoll(json, syncCerebellumFromBasalGangliaAndMidbrain);
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: toInputJsonValue(merged) },
    });
    synced++;
  }

  logger.info("cerebellum_motor_refinement_publish_sync_cycle", { synced });
  return { synced };
}
