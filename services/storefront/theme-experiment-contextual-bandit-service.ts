import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import { armWeightsRecord, readExperimentArms } from "@/lib/storefront/theme-experiment-multi-arm";
import { isContextualBanditEnabled } from "@/lib/storefront/theme-experiment-contextual-bandit";
import { readMabSnapshot } from "@/lib/storefront/theme-experiment-mab";
import { getThemeExperimentVersion } from "@/lib/storefront/theme-experiment-version";
import { enqueueThemeExperimentEdgeSync } from "@/services/storefront/storefront-edge-sync-job-service";

/**
 * Derive per-segment armWeights from MAB snapshot (mobile/desktop/returning/new).
 * BQ off-policy webhook can refine weights later.
 */
export async function runContextualBanditSegmentUpdate(): Promise<{ updated: number }> {
  if (!isContextualBanditEnabled()) return { updated: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, storeSlug: true, themeExperimentJson: true },
  });

  let updated = 0;
  for (const sf of storefronts) {
    const mab = readMabSnapshot(sf.themeExperimentJson);
    const arms = readExperimentArms(sf.themeExperimentJson);
    const defaultWeights = mab
      ? Object.fromEntries(mab.arms.map((a) => [a.armId, Math.round((a.trials / Math.max(1, mab.arms.reduce((s, x) => s + x.trials, 0))) * 100)]))
      : armWeightsRecord(arms);

    const boost = (factor: number) => {
      const out: Record<string, number> = {};
      for (const [id, w] of Object.entries(defaultWeights)) {
        out[id] = Math.max(1, Math.round(w * factor));
      }
      return out;
    };

    const segmentArmWeights = {
      default: defaultWeights,
      mobile: boost(1.05),
      desktop: boost(0.98),
      returning: boost(1.08),
      new: boost(0.95),
    };

    const base =
      sf.themeExperimentJson && typeof sf.themeExperimentJson === "object" && !Array.isArray(sf.themeExperimentJson)
        ? { ...(sf.themeExperimentJson as Record<string, unknown>) }
        : {};

    base.segmentArmWeights = segmentArmWeights;
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

  return { updated };
}
