import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  isArcticQuantumMeshEnabled,
  syncArcticFromGreenlandIcelandRelays,
} from "@/lib/storefront/theme-experiment-arctic-quantum-mesh";
import { syncPanPacificFromTasmanRelays } from "@/lib/storefront/theme-experiment-pan-pacific-quantum-mesh";
import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson } from "@/lib/prisma/json";

export async function runArcticQuantumMeshSyncCycle(): Promise<{ synced: number }> {
  if (!isArcticQuantumMeshEnabled()) return { synced: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, themeExperimentJson: true },
    take: 100,
  });

  let synced = 0;
  for (const sf of storefronts) {
    let json = coalesceThemeExperimentJson(sf.themeExperimentJson);
    json = applyThemeExperimentPoll(json, syncPanPacificFromTasmanRelays);
    const merged = applyThemeExperimentPoll(json, syncArcticFromGreenlandIcelandRelays);
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: toInputJsonValue(merged) },
    });
    synced++;
  }

  logger.info("arctic_quantum_mesh_sync_cycle", { synced });
  return { synced };
}
