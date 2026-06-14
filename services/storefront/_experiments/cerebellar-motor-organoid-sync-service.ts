import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  isCerebellarMotorOrganoidEnabled,
  syncCerebellarFromEthicsBoard,
} from "@/lib/storefront/theme-experiment-cerebellar-motor-organoid";
import { syncEthicsBoardFromPrefrontal } from "@/lib/storefront/theme-experiment-prefrontal-ethics-board";
import { mergePrefrontalOrganoidMesh } from "@/lib/storefront/theme-experiment-prefrontal-organoid-mesh";
import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson } from "@/lib/prisma/json";

export async function runCerebellarMotorOrganoidSyncCycle(): Promise<{ synced: number }> {
  if (!isCerebellarMotorOrganoidEnabled()) return { synced: 0 };

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
    const ethics = syncEthicsBoardFromPrefrontal(json);
    json = applyThemeExperimentPoll(json, () => ({ json: ethics.json }));
    const { json: withCb } = syncCerebellarFromEthicsBoard(json);
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: toInputJsonValue(withCb) },
    });
    synced++;
  }

  logger.info("cerebellar_motor_organoid_sync_cycle", { synced });
  return { synced };
}
