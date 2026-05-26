import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  listArchivedCronSlugsFromDisk,
  readCronArchiveManifest,
} from "@/services/cron/cron-archive";
import {
  listCronRouteSlugsFromDisk,
  partitionCronRouteSlugs,
} from "@/services/cron/cron-route-inventory";
import {
  ALLOWED_PRODUCTION_CRON_SLUGS,
  PRODUCTION_CRON_SCHEDULES,
  buildProductionCronEntries,
  isAllowedProductionCronSlug,
} from "@/services/cron/production-manifest";

export type CronEntry = { path: string; schedule: string };

export type CronEntryComparison = {
  missingPaths: string[];
  extraPaths: string[];
  duplicatePaths: string[];
  scheduleMismatches: Array<{ path: string; expected: string; actual: string }>;
};

export type ProductionCronReconciliationReport = {
  ok: boolean;
  manifest: {
    allowlistedSlugs: string[];
    missingSchedules: string[];
    extraScheduleKeys: string[];
  };
  routes: {
    activeSlugs: string[];
    missingProductionRoutes: string[];
    experimentalCount: number;
  };
  archive: {
    archivedSlugs: string[];
    archivedProductionSlugs: string[];
    manifestMissingOnDisk: string[];
    diskMissingFromManifest: string[];
  };
  vercelJson: CronEntryComparison & { present: boolean };
  productionProfile: CronEntryComparison & { present: boolean };
};

export type ProductionCronReconciliationInput = {
  activeRouteSlugs?: string[];
  archivedRouteSlugs?: string[];
  archiveManifestSlugs?: string[];
  expectedEntries?: CronEntry[];
  vercelEntries?: CronEntry[] | null;
  productionProfileEntries?: CronEntry[] | null;
};

const ROOT = process.cwd();
const VERCEL_PATH = join(ROOT, "vercel.json");
const PRODUCTION_PROFILE_PATH = join(ROOT, "config/vercel/crons-production.json");

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)].sort();
}

function findDuplicatePaths(entries: CronEntry[]): string[] {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    counts.set(entry.path, (counts.get(entry.path) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([path]) => path)
    .sort();
}

function compareCronEntries(expected: CronEntry[], actual: CronEntry[] | null): CronEntryComparison & { present: boolean } {
  if (actual == null) {
    return {
      present: false,
      missingPaths: [],
      extraPaths: [],
      duplicatePaths: [],
      scheduleMismatches: [],
    };
  }

  const expectedByPath = new Map(expected.map((entry) => [entry.path, entry.schedule]));
  const actualPaths = actual.map((entry) => entry.path);
  const actualPathSet = new Set(actualPaths);
  const expectedPaths = expected.map((entry) => entry.path);
  const expectedPathSet = new Set(expectedPaths);

  return {
    present: true,
    missingPaths: expectedPaths.filter((path) => !actualPathSet.has(path)),
    extraPaths: uniqueStrings(actualPaths.filter((path) => !expectedPathSet.has(path))),
    duplicatePaths: findDuplicatePaths(actual),
    scheduleMismatches: uniqueStrings(actualPaths)
      .map((path) => {
        const actualEntry = actual.find((entry) => entry.path === path);
        const expectedSchedule = expectedByPath.get(path);
        if (!actualEntry || !expectedSchedule || actualEntry.schedule === expectedSchedule) return null;
        return { path, expected: expectedSchedule, actual: actualEntry.schedule };
      })
      .filter((entry): entry is { path: string; expected: string; actual: string } => entry !== null),
  };
}

function readCronEntriesFromVercelJson(): CronEntry[] | null {
  if (!existsSync(VERCEL_PATH)) return null;
  const parsed = JSON.parse(readFileSync(VERCEL_PATH, "utf8")) as { crons?: CronEntry[] };
  return Array.isArray(parsed.crons) ? parsed.crons : [];
}

function readCronEntriesArray(path: string): CronEntry[] | null {
  if (!existsSync(path)) return null;
  const parsed = JSON.parse(readFileSync(path, "utf8")) as unknown;
  return Array.isArray(parsed) ? (parsed as CronEntry[]) : [];
}

export function reconcileProductionCronState(
  input: ProductionCronReconciliationInput = {},
): ProductionCronReconciliationReport {
  const allowlistedSlugs = [...ALLOWED_PRODUCTION_CRON_SLUGS];
  const allowlistedSlugSet = new Set<string>(allowlistedSlugs);
  const scheduleKeys = Object.keys(PRODUCTION_CRON_SCHEDULES);
  const expectedEntries = input.expectedEntries ?? buildProductionCronEntries();
  const activeRouteSlugs = uniqueStrings(input.activeRouteSlugs ?? listCronRouteSlugsFromDisk());
  const routePartition = partitionCronRouteSlugs(activeRouteSlugs);
  const archivedRouteSlugs = uniqueStrings(input.archivedRouteSlugs ?? listArchivedCronSlugsFromDisk());
  const archiveManifestSlugs = uniqueStrings(
    input.archiveManifestSlugs ?? readCronArchiveManifest().slugs,
  );

  const missingSchedules = allowlistedSlugs.filter((slug) => !PRODUCTION_CRON_SCHEDULES[slug]);
  const extraScheduleKeys = scheduleKeys.filter((slug) => !allowlistedSlugSet.has(slug));
  const archivedProductionSlugs = archivedRouteSlugs.filter((slug) => isAllowedProductionCronSlug(slug));
  const manifestMissingOnDisk = archiveManifestSlugs.filter((slug) => !archivedRouteSlugs.includes(slug));
  const diskMissingFromManifest = archivedRouteSlugs.filter((slug) => !archiveManifestSlugs.includes(slug));
  const vercelJson = compareCronEntries(expectedEntries, input.vercelEntries ?? readCronEntriesFromVercelJson());
  const productionProfile = compareCronEntries(
    expectedEntries,
    input.productionProfileEntries ?? readCronEntriesArray(PRODUCTION_PROFILE_PATH),
  );

  const ok =
    missingSchedules.length === 0 &&
    extraScheduleKeys.length === 0 &&
    routePartition.missingRoutes.length === 0 &&
    archivedProductionSlugs.length === 0 &&
    manifestMissingOnDisk.length === 0 &&
    diskMissingFromManifest.length === 0 &&
    vercelJson.present &&
    vercelJson.missingPaths.length === 0 &&
    vercelJson.extraPaths.length === 0 &&
    vercelJson.duplicatePaths.length === 0 &&
    vercelJson.scheduleMismatches.length === 0 &&
    productionProfile.present &&
    productionProfile.missingPaths.length === 0 &&
    productionProfile.extraPaths.length === 0 &&
    productionProfile.duplicatePaths.length === 0 &&
    productionProfile.scheduleMismatches.length === 0;

  return {
    ok,
    manifest: {
      allowlistedSlugs,
      missingSchedules,
      extraScheduleKeys,
    },
    routes: {
      activeSlugs: activeRouteSlugs,
      missingProductionRoutes: routePartition.missingRoutes,
      experimentalCount: routePartition.experimental.length,
    },
    archive: {
      archivedSlugs: archivedRouteSlugs,
      archivedProductionSlugs,
      manifestMissingOnDisk,
      diskMissingFromManifest,
    },
    vercelJson,
    productionProfile,
  };
}
