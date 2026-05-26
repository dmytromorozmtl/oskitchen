import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import { parseThemeExperimentConfig } from "@/lib/storefront/theme-experiment";
import {
  applyLinUcbCircuitBreaker,
  isFeatureStreamBusEnabled,
  readFeatureStreamBuffer,
} from "@/lib/storefront/theme-experiment-feature-stream-bus";
import { mergeLinUcbIntoJson, readLinUcbSnapshot } from "@/lib/storefront/theme-experiment-linucb";
import { notifyExperimentRegretBudgetExceeded } from "@/lib/storefront/theme-experiment-regret-alerts";
import { enqueueThemeExperimentEdgeSync } from "@/services/storefront/storefront-edge-sync-job-service";
import { logger } from "@/lib/logger";

/** O2 — 60s LinUCB refresh from feature stream buffer → edge PATCH. */
export async function runLinUcbRealtimeEdgeUpdate(): Promise<{ updated: number; capped: number }> {
  if (!isFeatureStreamBusEnabled()) return { updated: 0, capped: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, storeSlug: true, workspaceId: true, themeExperimentJson: true },
  });

  let updated = 0;
  let capped = 0;

  for (const sf of storefronts) {
    const exp = parseThemeExperimentConfig(sf.themeExperimentJson);
    if (!exp?.enabled) continue;

    const buf = readFeatureStreamBuffer(sf.themeExperimentJson);
    const snap = readLinUcbSnapshot(sf.themeExperimentJson);
    if (!snap) continue;

    const adjusted = buf?.explorationCapped
      ? applyLinUcbCircuitBreaker(snap, buf.regretPp)
      : snap;
    if (buf?.explorationCapped) capped++;

    const merged = mergeLinUcbIntoJson(sf.themeExperimentJson, adjusted);
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: merged as object },
    });

    await enqueueThemeExperimentEdgeSync({
      storefrontId: sf.id,
      storeSlug: sf.storeSlug,
      themeExperimentJson: merged,
    });

    if (buf && buf.regretPp > 3) {
      await notifyExperimentRegretBudgetExceeded({
        storeSlug: sf.storeSlug,
        storefrontId: sf.id,
        workspaceId: sf.workspaceId,
        themeExperimentJson: merged,
      });
    }

    updated++;
    logger.info("experiment_linucb_realtime_edge_patch", {
      storeSlug: sf.storeSlug,
      regretPp: buf?.regretPp,
      exploration: adjusted.explorationPercent,
    });
  }

  return { updated, capped };
}
