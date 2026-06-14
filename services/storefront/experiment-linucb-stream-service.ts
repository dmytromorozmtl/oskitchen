import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import { parseThemeExperimentConfig } from "@/lib/storefront/theme-experiment";
import { isLinUcbEnabled, readLinUcbSnapshot } from "@/lib/storefront/theme-experiment-linucb";
import { notifyExperimentRegretBudgetExceeded } from "@/lib/storefront/theme-experiment-regret-alerts";
import { logger } from "@/lib/logger";

/** Flush feature-stream buffer + regret checks (15m cron companion to BQ webhook). */
export async function runExperimentLinUcbStreamCycle(): Promise<{ checked: number; alerts: number }> {
  if (!isLinUcbEnabled()) return { checked: 0, alerts: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, storeSlug: true, workspaceId: true, themeExperimentJson: true },
  });

  let checked = 0;
  let alerts = 0;

  for (const sf of storefronts) {
    const exp = parseThemeExperimentConfig(sf.themeExperimentJson);
    if (!exp?.enabled) continue;
    const snap = readLinUcbSnapshot(sf.themeExperimentJson);
    if (!snap) continue;

    checked++;
    const fired = await notifyExperimentRegretBudgetExceeded({
      storeSlug: sf.storeSlug,
      storefrontId: sf.id,
      workspaceId: sf.workspaceId,
      themeExperimentJson: sf.themeExperimentJson,
    });
    if (fired) alerts++;

    logger.info("experiment_linucb_stream_tick", {
      storeSlug: sf.storeSlug,
      regretPp: snap.regretPp,
      explorationPercent: snap.explorationPercent,
    });
  }

  return { checked, alerts };
}
