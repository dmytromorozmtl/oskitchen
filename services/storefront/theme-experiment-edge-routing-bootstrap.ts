import { isThemeExperimentEdgeEnabled } from "@/lib/storefront/theme-experiment-edge-config";
import { toJsonValue } from "@/lib/prisma/json";
import { parseThemeExperimentConfig } from "@/lib/storefront/theme-experiment";
import { enqueueThemeExperimentEdgeSync } from "@/services/storefront/storefront-edge-sync-job-service";

/**
 * On storefront create / slug change: enqueue edge sync so routing keys exist without manual backfill.
 */
export async function bootstrapThemeExperimentEdgeRouting(input: {
  storefrontId: string;
  storeSlug: string;
  workspaceId?: string | null;
  themeExperimentJson: unknown;
}): Promise<void> {
  if (!isThemeExperimentEdgeEnabled()) return;

  const exp = parseThemeExperimentConfig(input.themeExperimentJson);
  if (!exp?.enabled) return;

  await enqueueThemeExperimentEdgeSync({
    storefrontId: input.storefrontId,
    storeSlug: input.storeSlug,
    themeExperimentJson: input.themeExperimentJson,
  });
}
