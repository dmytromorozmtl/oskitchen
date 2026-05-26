import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  isJupiterTrojanDtnLagrangeEnabled,
  syncJupiterTrojanFromLagrangePoints,
} from "@/lib/storefront/theme-experiment-jupiter-trojan-dtn-lagrange";
import { syncMartianOrbitalFromOlympusValles } from "@/lib/storefront/theme-experiment-martian-orbital-dtn-relay";
import { syncLunarFarsideFromShackletonMalapert } from "@/lib/storefront/theme-experiment-lunar-farside-dtn-mesh";
import { syncAntarcticSubglacialFromMcmurdoPalmer } from "@/lib/storefront/theme-experiment-antarctic-subglacial-mesh";
import { syncArcticFromGreenlandIcelandRelays } from "@/lib/storefront/theme-experiment-arctic-quantum-mesh";
import { syncPanPacificFromTasmanRelays } from "@/lib/storefront/theme-experiment-pan-pacific-quantum-mesh";
import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson } from "@/lib/prisma/json";

export async function runJupiterTrojanDtnLagrangeSyncCycle(): Promise<{ synced: number }> {
  if (!isJupiterTrojanDtnLagrangeEnabled()) return { synced: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, themeExperimentJson: true },
    take: 100,
  });

  let synced = 0;
  for (const sf of storefronts) {
    let json = coalesceThemeExperimentJson(sf.themeExperimentJson);
    json = applyThemeExperimentPoll(json, syncPanPacificFromTasmanRelays);
    json = applyThemeExperimentPoll(json, syncArcticFromGreenlandIcelandRelays);
    json = applyThemeExperimentPoll(json, syncAntarcticSubglacialFromMcmurdoPalmer);
    json = applyThemeExperimentPoll(json, syncLunarFarsideFromShackletonMalapert);
    json = applyThemeExperimentPoll(json, syncMartianOrbitalFromOlympusValles);
    const merged = applyThemeExperimentPoll(json, syncJupiterTrojanFromLagrangePoints);
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: toInputJsonValue(merged) },
    });
    synced++;
  }

  logger.info("jupiter_trojan_dtn_lagrange_sync_cycle", { synced });
  return { synced };
}
