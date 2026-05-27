/**
 * CI: production cron routes exist on disk; archive state stays consistent.
 *
 * Prefer: npm run validate:cron-inventory
 */
import {
  assertCronRouteInventory,
  validateCronRouteInventory,
} from "../services/cron/cron-route-inventory-validation";

const asJson = process.argv.includes("--json");

function main(): void {
  const report = validateCronRouteInventory();

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
    if (!report.ok) process.exitCode = 1;
    return;
  }

  console.log("=== Cron route inventory ===\n");
  console.log(`Total route.ts folders: ${report.totalRoutes}`);
  console.log(`Production (allowlist): ${report.productionOnDisk}/${report.productionAllowlist}`);
  console.log(`Experimental (active on disk): ${report.experimentalOnDisk}`);
  console.log(`Archived (off App Router): ${report.archivedRoutes}`);
  if (report.missingProductionRoutes.length) {
    console.error("\nMissing production route files:", report.missingProductionRoutes.join(", "));
  }
  if (report.unknownOnDisk.length) {
    console.warn("\nUnexpected slugs (not prod/experimental classification):", report.unknownOnDisk.join(", "));
  }
  if (report.archivedProductionSlugs.length) {
    console.error("\nArchived production slugs:", report.archivedProductionSlugs.join(", "));
  }
  if (report.manifestMissingOnDisk.length) {
    console.error("\nArchive manifest missing on disk:", report.manifestMissingOnDisk.join(", "));
  }
  if (report.diskMissingFromManifest.length) {
    console.error("\nArchive disk missing from manifest:", report.diskMissingFromManifest.join(", "));
  }

  try {
    assertCronRouteInventory(report);
    console.log(
      `\n✓ Cron inventory OK (${report.experimentalOnDisk} experimental, capped at ${report.maxExperimental}).`,
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

main();
