import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import { logger } from "@/lib/logger";
import {
  applyAutoHoldoutBump,
  isInterferenceMatrixEnabled,
  readInterferenceMatrix,
} from "@/lib/storefront/theme-experiment-interference-matrix";
import { readPostWinnerHoldoutPercent } from "@/lib/storefront/theme-experiment-holdout";

export async function runInterferenceHoldoutBumpCycle(): Promise<{
  checked: number;
  bumped: number;
}> {
  if (!isInterferenceMatrixEnabled()) return { checked: 0, bumped: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, storeSlug: true, themeExperimentJson: true },
  });

  let checked = 0;
  let bumped = 0;

  for (const sf of storefronts) {
    const matrix = readInterferenceMatrix(sf.themeExperimentJson);
    if (!matrix || matrix.recommendedHoldoutBumpPercent <= 0) continue;
    if (matrix.autoHoldoutApplied) continue;

    checked++;
    const current = readPostWinnerHoldoutPercent(sf.themeExperimentJson) ?? 5;
    const { applied, json, holdoutPercent } = applyAutoHoldoutBump(sf.themeExperimentJson, current);

    if (applied) {
      bumped++;
      await prisma.storefrontSettings.update({
        where: { id: sf.id },
        data: { themeExperimentJson: json as object },
      });
      logger.info("interference_holdout_bump", {
        storeSlug: sf.storeSlug,
        holdoutPercent,
        bump: matrix.recommendedHoldoutBumpPercent,
      });
    }
  }

  return { checked, bumped };
}
