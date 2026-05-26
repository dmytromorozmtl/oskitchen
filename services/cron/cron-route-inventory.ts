import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import {
  ALLOWED_PRODUCTION_CRON_SLUGS,
  isAllowedProductionCronSlug,
  isExperimentalCronSlug,
} from "@/services/cron/production-manifest";

const CRON_ROOT = join(process.cwd(), "app/api/cron");

/** Discover `/api/cron/{slug}` slugs from filesystem route folders. */
export function listCronRouteSlugsFromDisk(): string[] {
  if (!statSync(CRON_ROOT, { throwIfNoEntry: false })) return [];
  return readdirSync(CRON_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
    .filter((d) => statSync(join(CRON_ROOT, d.name, "route.ts"), { throwIfNoEntry: false }))
    .map((d) => d.name)
    .sort();
}

export type CronRoutePartition = {
  production: string[];
  experimental: string[];
  unknownOnDisk: string[];
  missingRoutes: string[];
};

export function partitionCronRouteSlugs(slugs: string[] = listCronRouteSlugsFromDisk()): CronRoutePartition {
  const slugSet = new Set(slugs);
  const production = ALLOWED_PRODUCTION_CRON_SLUGS.filter((s) => slugSet.has(s));
  const missingRoutes = ALLOWED_PRODUCTION_CRON_SLUGS.filter((s) => !slugSet.has(s));
  const experimental = slugs.filter((s) => isExperimentalCronSlug(s));
  const unknownOnDisk = slugs.filter((s) => !isAllowedProductionCronSlug(s) && !isExperimentalCronSlug(s));
  return { production, experimental, unknownOnDisk, missingRoutes };
}

/** Slugs for all non-production cron routes currently on disk (for ops / inventory). */
export function listExperimentalCronSlugsOnDisk(): string[] {
  return partitionCronRouteSlugs().experimental;
}

/** Full paths `/api/cron/{slug}` for experimental routes on disk. */
export function listExperimentalCronPathsOnDisk(): string[] {
  return listExperimentalCronSlugsOnDisk().map((slug) => `/api/cron/${slug}`);
}

/**
 * Recomputed from `app/api/cron/*` at call time (not a static array).
 * Use `isExperimentalCronPath` in request handlers.
 */
export function EXPERIMENTAL_CRON_PATHS(): string[] {
  return listExperimentalCronPathsOnDisk();
}
