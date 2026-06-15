import { logger } from "@/lib/logger";
import { purgeStorefrontThemeExperimentArmTags } from "@/lib/storefront/cdn-purge";
import { readExperimentArms } from "@/lib/storefront/theme-experiment-multi-arm";
import { logThemeExperimentObservability } from "@/lib/storefront/theme-experiment-observability";

/** Coordinated CDN purge after multi-store conclude (agency workspace). */
export async function purgeWorkspaceExperimentArms(input: {
  workspaceId: string;
  stores: { storeSlug: string; themeExperimentJson: unknown }[];
}): Promise<{ purged: number }> {
  if (input.stores.length === 0) return { purged: 0 };

  const results = await Promise.allSettled(
    input.stores.map(async (store) => {
      const arms = readExperimentArms(store.themeExperimentJson);
      await purgeStorefrontThemeExperimentArmTags(store.storeSlug);
      return arms.length;
    }),
  );

  const purged = results.filter((r) => r.status === "fulfilled").length;
  logThemeExperimentObservability("cdn_purge_coordinated", {
    workspace_id: input.workspaceId,
    store_count: input.stores.length,
    purged,
  });
  logger.info("experiment_coordinated_cdn_purge", {
    workspaceId: input.workspaceId,
    storeCount: input.stores.length,
    purged,
  });

  return { purged };
}
