import { prisma } from "@/lib/prisma";
import { toJsonValue, type ThemeExperimentJson } from "@/lib/prisma/json";
import {
  buildThemeExperimentJsonConclude,
  parseThemeExperimentStored,
  type ThemeExperimentConcludeOutcome,
} from "@/lib/storefront/theme-experiment-version";
import { enqueueThemeExperimentEdgeSync } from "@/services/storefront/storefront-edge-sync-job-service";

/**
 * Disable experiment, bump version, enqueue Edge Config delete.
 * No-op when experiment is already off.
 */
export async function concludeThemeExperimentLifecycle(input: {
  storefrontId: string;
  storeSlug: string;
  themeExperimentJson: unknown;
  outcome: ThemeExperimentConcludeOutcome;
}): Promise<{ concluded: boolean; themeExperimentJson: unknown }> {
  const stored = parseThemeExperimentStored(input.themeExperimentJson);
  if (!stored?.enabled) {
    return { concluded: false, themeExperimentJson: input.themeExperimentJson };
  }

  const themeExperimentJson = buildThemeExperimentJsonConclude({
    previousRaw: input.themeExperimentJson,
    outcome: input.outcome,
  });

  await prisma.storefrontSettings.update({
    where: { id: input.storefrontId },
    data: { themeExperimentJson },
  });

  await enqueueThemeExperimentEdgeSync({
    storefrontId: input.storefrontId,
    storeSlug: input.storeSlug,
    themeExperimentJson,
  });

  return { concluded: true, themeExperimentJson };
}
