import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  isPlutoCharonBinaryDtnBarycenterEnabled,
  syncPlutoCharonFromBinaryBarycenter,
} from "@/lib/storefront/theme-experiment-pluto-charon-binary-dtn-barycenter";
import { syncNeptuneHaloFromTritonRetrograde } from "@/lib/storefront/theme-experiment-neptune-triton-retrograde-dtn-halo";
import { syncUranusPolarFromObliquityTilt } from "@/lib/storefront/theme-experiment-uranus-obliquity-dtn-polar-relay";
import { syncSaturnRingFromShepherdPan } from "@/lib/storefront/theme-experiment-saturn-ring-dtn-shepherd";
import { syncJupiterTrojanFromLagrangePoints } from "@/lib/storefront/theme-experiment-jupiter-trojan-dtn-lagrange";
import { syncMartianOrbitalFromOlympusValles } from "@/lib/storefront/theme-experiment-martian-orbital-dtn-relay";
import { syncLunarFarsideFromShackletonMalapert } from "@/lib/storefront/theme-experiment-lunar-farside-dtn-mesh";
import { syncAntarcticSubglacialFromMcmurdoPalmer } from "@/lib/storefront/theme-experiment-antarctic-subglacial-mesh";
import { syncArcticFromGreenlandIcelandRelays } from "@/lib/storefront/theme-experiment-arctic-quantum-mesh";
import { syncPanPacificFromTasmanRelays } from "@/lib/storefront/theme-experiment-pan-pacific-quantum-mesh";
import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson } from "@/lib/prisma/json";

export async function runPlutoCharonBinaryDtnBarycenterSyncCycle(): Promise<{ synced: number }> {
  if (!isPlutoCharonBinaryDtnBarycenterEnabled()) return { synced: 0 };

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
    json = applyThemeExperimentPoll(json, syncJupiterTrojanFromLagrangePoints);
    json = applyThemeExperimentPoll(json, syncSaturnRingFromShepherdPan);
    json = applyThemeExperimentPoll(json, syncUranusPolarFromObliquityTilt);
    json = applyThemeExperimentPoll(json, syncNeptuneHaloFromTritonRetrograde);
    const merged = applyThemeExperimentPoll(json, syncPlutoCharonFromBinaryBarycenter);
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: toInputJsonValue(merged) },
    });
    synced++;
  }

  logger.info("pluto_charon_binary_dtn_barycenter_sync_cycle", { synced });
  return { synced };
}
