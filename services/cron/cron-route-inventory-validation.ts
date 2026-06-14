import { cronArchiveStatus } from "@/services/cron/cron-archive";
import {
  listCronRouteSlugsFromDisk,
  partitionCronRouteSlugs,
} from "@/services/cron/cron-route-inventory";
import { reconcileProductionCronState } from "@/services/cron/cron-reconciliation";
import { ALLOWED_PRODUCTION_CRON_SLUGS, STAGING_UTILITY_CRON_SLUGS } from "@/services/cron/production-manifest";

export type CronRouteInventoryReport = {
  ok: boolean;
  totalRoutes: number;
  productionAllowlist: number;
  productionOnDisk: number;
  stagingUtilityOnDisk: number;
  experimentalOnDisk: number;
  archivedRoutes: number;
  missingProductionRoutes: string[];
  unknownOnDisk: string[];
  archivedProductionSlugs: string[];
  manifestMissingOnDisk: string[];
  diskMissingFromManifest: string[];
  experimentalSlugs: string[];
  maxExperimental: number;
};

export type CronRouteInventoryValidationInput = {
  maxExperimental?: number;
  activeRouteSlugs?: string[];
};

function listNonEmpty(label: string, values: string[]): string[] {
  return values.length > 0 ? [`${label}: ${values.join(", ")}`] : [];
}

export function validateCronRouteInventory(
  input: CronRouteInventoryValidationInput = {},
): CronRouteInventoryReport {
  const maxExperimental = input.maxExperimental ?? Number(process.env.CRON_EXPERIMENTAL_MAX ?? "200");
  const slugs = input.activeRouteSlugs ?? listCronRouteSlugsFromDisk();
  const partition = partitionCronRouteSlugs(slugs);
  const archive = cronArchiveStatus();
  const reconciliation = reconcileProductionCronState({
    activeRouteSlugs: slugs,
  });

  const stagingUtilitySet = new Set<string>(STAGING_UTILITY_CRON_SLUGS);
  const stagingUtilityOnDisk = slugs.filter((s) => stagingUtilitySet.has(s)).length;

  const ok =
    partition.missingRoutes.length === 0 &&
    reconciliation.archive.archivedProductionSlugs.length === 0 &&
    reconciliation.archive.manifestMissingOnDisk.length === 0 &&
    reconciliation.archive.diskMissingFromManifest.length === 0 &&
    partition.experimental.length <= maxExperimental;

  return {
    ok,
    totalRoutes: slugs.length,
    productionAllowlist: ALLOWED_PRODUCTION_CRON_SLUGS.length,
    productionOnDisk: partition.production.length,
    stagingUtilityOnDisk,
    experimentalOnDisk: partition.experimental.length,
    archivedRoutes: archive.archivedTotal,
    missingProductionRoutes: partition.missingRoutes,
    unknownOnDisk: partition.unknownOnDisk,
    archivedProductionSlugs: reconciliation.archive.archivedProductionSlugs,
    manifestMissingOnDisk: reconciliation.archive.manifestMissingOnDisk,
    diskMissingFromManifest: reconciliation.archive.diskMissingFromManifest,
    experimentalSlugs: partition.experimental,
    maxExperimental,
  };
}

/** Human-readable cron inventory failures for CI logs and thrown assertions. */
export function formatCronRouteInventoryFailures(report: CronRouteInventoryReport): string[] {
  const lines: string[] = [];
  lines.push(...listNonEmpty("missing production routes on disk", report.missingProductionRoutes));
  lines.push(...listNonEmpty("archived production slugs", report.archivedProductionSlugs));
  lines.push(...listNonEmpty("archive manifest missing on disk", report.manifestMissingOnDisk));
  lines.push(...listNonEmpty("archive disk missing from manifest", report.diskMissingFromManifest));
  if (report.experimentalOnDisk > report.maxExperimental) {
    lines.push(
      `experimental cron count ${report.experimentalOnDisk} exceeds CRON_EXPERIMENTAL_MAX=${report.maxExperimental}`,
    );
  }
  return lines;
}

export function assertCronRouteInventory(
  report: CronRouteInventoryReport = validateCronRouteInventory(),
): CronRouteInventoryReport {
  if (report.ok) return report;
  const detail = formatCronRouteInventoryFailures(report).join("\n  ");
  throw new Error(
    `cron route inventory validation failed\n  ${detail}\n\nFix: npm run cron:archive:experimental (see docs/CRON_ARCHIVE_RUNBOOK.md)`,
  );
}
