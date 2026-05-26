import { logger } from "@/lib/logger";
import { storefrontThemeArmCacheTag } from "@/lib/storefront/cdn-cache";
import type { ThemeExperimentArm } from "@/lib/storefront/theme-experiment";
import { getThemeExperimentVersion, parseThemeExperimentStored } from "@/lib/storefront/theme-experiment-version";
import { readEdgeExperimentVersionForStore } from "@/lib/storefront/theme-experiment-edge-read";

export type ExperimentCdnPurgeGate = {
  experimentEnabled: boolean;
  dbVersion: number;
  edgeVersion: number | null;
  versionsMatch: boolean;
  /** Skip arm-specific CDN tags when edge is behind DB (stale arm purge). */
  skipArmTags: boolean;
  armTags: string[];
};

/**
 * Version gate (5C): only purge per-arm cache tags when Edge Config version matches DB.
 */
export async function evaluateExperimentCdnPurgeGate(input: {
  storeSlug: string;
  themeExperimentJson: unknown;
}): Promise<ExperimentCdnPurgeGate> {
  const stored = parseThemeExperimentStored(input.themeExperimentJson);
  const dbVersion = getThemeExperimentVersion(input.themeExperimentJson);
  const experimentEnabled = stored?.enabled === true;

  if (!experimentEnabled) {
    const arms: ThemeExperimentArm[] = ["published", "draft"];
    return {
      experimentEnabled: false,
      dbVersion,
      edgeVersion: null,
      versionsMatch: true,
      skipArmTags: false,
      armTags: arms.map((arm) => storefrontThemeArmCacheTag(input.storeSlug, arm)),
    };
  }

  const edgeVersion = await readEdgeExperimentVersionForStore(input.storeSlug);
  const versionsMatch = edgeVersion !== null && edgeVersion === dbVersion;
  const skipArmTags = !versionsMatch;

  if (skipArmTags) {
    logger.warn("cdn_purge_stale_experiment_skipped_arm_tags", {
      storeSlug: input.storeSlug,
      dbVersion,
      edgeVersion,
    });
  }

  const arms: ThemeExperimentArm[] = ["published", "draft"];
  const armTags = skipArmTags
    ? []
    : arms.map((arm) => storefrontThemeArmCacheTag(input.storeSlug, arm));

  return {
    experimentEnabled: true,
    dbVersion,
    edgeVersion,
    versionsMatch,
    skipArmTags,
    armTags,
  };
}
