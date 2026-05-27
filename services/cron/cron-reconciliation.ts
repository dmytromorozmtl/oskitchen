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

  return buildReport({
    ok,
    missingSchedules,
    extraScheduleKeys,
    routePartition,
    archivedRouteSlugs,
    archivedProductionSlugs,
    manifestMissingOnDisk,
    diskMissingFromManifest,
    vercelJson,
    productionProfile,
    allowlistedSlugs,
    activeRouteSlugs,
  });
}

function buildReport(input: {
  ok: boolean;
  missingSchedules: string[];
  extraScheduleKeys: string[];
  routePartition: ReturnType<typeof partitionCronRouteSlugs>;
  archivedRouteSlugs: string[];
  archivedProductionSlugs: string[];
  manifestMissingOnDisk: string[];
  diskMissingFromManifest: string[];
  vercelJson: CronEntryComparison & { present: boolean };
  productionProfile: CronEntryComparison & { present: boolean };
  allowlistedSlugs: readonly string[];
  activeRouteSlugs: string[];
}): ProductionCronReconciliationReport {
  return {
    ok: input.ok,
    manifest: {
      allowlistedSlugs: [...input.allowlistedSlugs],
      missingSchedules: input.missingSchedules,
      extraScheduleKeys: input.extraScheduleKeys,
    },
    routes: {
      activeSlugs: input.activeRouteSlugs,
      missingProductionRoutes: input.routePartition.missingRoutes,
      experimentalCount: input.routePartition.experimental.length,
    },
    archive: {
      archivedSlugs: input.archivedRouteSlugs,
      archivedProductionSlugs: input.archivedProductionSlugs,
      manifestMissingOnDisk: input.manifestMissingOnDisk,
      diskMissingFromManifest: input.diskMissingFromManifest,
    },
    vercelJson: input.vercelJson,
    productionProfile: input.productionProfile,
  };
}

function listNonEmpty(label: string, values: string[]): string[] {
  return values.length > 0 ? [`${label}: ${values.join(", ")}`] : [];
}

/** Human-readable reconciliation failures for CI logs and thrown assertions. */
export function formatProductionCronReconciliationFailures(
  report: ProductionCronReconciliationReport,
): string[] {
  const lines: string[] = [];
  lines.push(...listNonEmpty("manifest missing schedules", report.manifest.missingSchedules));
  lines.push(...listNonEmpty("manifest extra schedule keys", report.manifest.extraScheduleKeys));
  lines.push(
    ...listNonEmpty("missing production routes on disk", report.routes.missingProductionRoutes),
  );
  lines.push(
    ...listNonEmpty("archived production routes", report.archive.archivedProductionSlugs),
  );
  lines.push(
    ...listNonEmpty("archive manifest missing on disk", report.archive.manifestMissingOnDisk),
  );
  lines.push(
    ...listNonEmpty("archive disk missing from manifest", report.archive.diskMissingFromManifest),
  );
  if (!report.vercelJson.present) {
    lines.push("vercel.json crons: missing");
  } else {
    lines.push(...listNonEmpty("vercel.json missing paths", report.vercelJson.missingPaths));
    lines.push(...listNonEmpty("vercel.json extra paths", report.vercelJson.extraPaths));
    lines.push(...listNonEmpty("vercel.json duplicate paths", report.vercelJson.duplicatePaths));
    for (const mismatch of report.vercelJson.scheduleMismatches) {
      lines.push(
        `vercel.json schedule mismatch ${mismatch.path}: actual=${mismatch.actual} expected=${mismatch.expected}`,
      );
    }
  }
  if (!report.productionProfile.present) {
    lines.push("config/vercel/crons-production.json: missing");
  } else {
    lines.push(
      ...listNonEmpty("production profile missing paths", report.productionProfile.missingPaths),
    );
    lines.push(...listNonEmpty("production profile extra paths", report.productionProfile.extraPaths));
    lines.push(
      ...listNonEmpty("production profile duplicate paths", report.productionProfile.duplicatePaths),
    );
    for (const mismatch of report.productionProfile.scheduleMismatches) {
      lines.push(
        `production profile schedule mismatch ${mismatch.path}: actual=${mismatch.actual} expected=${mismatch.expected}`,
      );
    }
  }
  return lines;
}

export function assertProductionCronReconciliation(
  report: ProductionCronReconciliationReport = reconcileProductionCronState(),
): ProductionCronReconciliationReport {
  if (report.ok) return report;
  const detail = formatProductionCronReconciliationFailures(report).join("\n  ");
  throw new Error(
    `production cron reconciliation failed\n  ${detail}\n\nFix: npm run vercel:crons:production`,
  );
}
