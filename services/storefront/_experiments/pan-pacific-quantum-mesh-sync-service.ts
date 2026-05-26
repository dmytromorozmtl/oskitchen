import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  isPanPacificQuantumMeshEnabled,
  syncPanPacificFromTasmanRelays,
} from "@/lib/storefront/theme-experiment-pan-pacific-quantum-mesh";
import { attestIndoPacificCompact } from "@/lib/compliance/indo-pacific-compact";
import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson } from "@/lib/prisma/json";

export async function runPanPacificQuantumMeshSyncCycle(): Promise<{ synced: number }> {
  if (!isPanPacificQuantumMeshEnabled()) return { synced: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, themeExperimentJson: true },
    take: 100,
  });

  let synced = 0;
  for (const sf of storefronts) {
    let json = coalesceThemeExperimentJson(sf.themeExperimentJson);
    const ip = attestIndoPacificCompact(json);
    json = applyThemeExperimentPoll(json, () => ({ json: ip.json }));
    const merged = applyThemeExperimentPoll(json, syncPanPacificFromTasmanRelays);
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: toInputJsonValue(merged) },
    });
    synced++;
  }

  logger.info("pan_pacific_quantum_mesh_sync_cycle", { synced });
  return { synced };
}
