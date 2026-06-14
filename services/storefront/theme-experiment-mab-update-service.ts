import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import { readAllocationMode, readExperimentArms } from "@/lib/storefront/theme-experiment-multi-arm";
import { buildMabStateFromMetrics, isMabEnabled } from "@/lib/storefront/theme-experiment-mab";
import { getThemeExperimentVersion } from "@/lib/storefront/theme-experiment-version";
import { getThemeExperimentArmMetrics } from "@/services/storefront/theme-experiment-analytics-service";
import { enqueueThemeExperimentEdgeSync } from "@/services/storefront/storefront-edge-sync-job-service";

/** Nightly Thompson update — writes mabSnapshot + arm weights into themeExperimentJson. */
export async function runThemeExperimentMabUpdateCycle(): Promise<{
  updated: number;
  skipped: number;
}> {
  if (!isMabEnabled()) return { updated: 0, skipped: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, storeSlug: true, themeExperimentJson: true },
  });

  let updated = 0;
  let skipped = 0;

  for (const sf of storefronts) {
    if (readAllocationMode(sf.themeExperimentJson) !== "mab") {
      skipped++;
      continue;
    }

    const arms = readExperimentArms(sf.themeExperimentJson);
    const metrics = await getThemeExperimentArmMetrics(sf.id, 14, sf.themeExperimentJson);
    const snapshot = buildMabStateFromMetrics(arms, metrics);
    const base =
      sf.themeExperimentJson && typeof sf.themeExperimentJson === "object" && !Array.isArray(sf.themeExperimentJson)
        ? { ...(sf.themeExperimentJson as Record<string, unknown>) }
        : {};

    base.mabSnapshot = snapshot;
    base.experimentArms = arms;
    base.allocationMode = "mab";
    base.version = getThemeExperimentVersion(sf.themeExperimentJson) + 1;
    base.updatedAt = new Date().toISOString();

    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: base as object },
    });

    await enqueueThemeExperimentEdgeSync({
      storefrontId: sf.id,
      storeSlug: sf.storeSlug,
      themeExperimentJson: base,
    });

    updated++;
  }

  return { updated, skipped };
}
