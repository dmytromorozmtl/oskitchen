/**
 * CI: production cron routes exist on disk; vercel.json stays on allowlist (see validate-production-crons).
 *
 *   npx tsx scripts/validate-cron-route-inventory.ts
 *   npx tsx scripts/validate-cron-route-inventory.ts --json
 */
import { cronArchiveStatus } from "../services/cron/cron-archive";
import {
  listCronRouteSlugsFromDisk,
  partitionCronRouteSlugs,
} from "../services/cron/cron-route-inventory";
import { reconcileProductionCronState } from "../services/cron/cron-reconciliation";
import { ALLOWED_PRODUCTION_CRON_SLUGS } from "../services/cron/production-manifest";

const asJson = process.argv.includes("--json");
const maxExperimental = Number(process.env.CRON_EXPERIMENTAL_MAX ?? "200");

function main() {
  const slugs = listCronRouteSlugsFromDisk();
  const partition = partitionCronRouteSlugs(slugs);
  const archive = cronArchiveStatus();
  const reconciliation = reconcileProductionCronState({
    activeRouteSlugs: slugs,
  });

  const report = {
    totalRoutes: slugs.length,
    productionAllowlist: ALLOWED_PRODUCTION_CRON_SLUGS.length,
    productionOnDisk: partition.production.length,
    experimentalOnDisk: partition.experimental.length,
    archivedRoutes: archive.archivedTotal,
    missingProductionRoutes: partition.missingRoutes,
    unknownOnDisk: partition.unknownOnDisk,
  };

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log("=== Cron route inventory ===\n");
    console.log(`Total route.ts folders: ${report.totalRoutes}`);
    console.log(`Production (allowlist): ${report.productionOnDisk}/${report.productionAllowlist}`);
    console.log(`Experimental (active on disk): ${report.experimentalOnDisk}`);
    console.log(`Archived (off App Router): ${report.archivedRoutes}`);
    if (partition.missingRoutes.length) {
      console.error("\nMissing production route files:", partition.missingRoutes.join(", "));
    }
    if (partition.unknownOnDisk.length) {
      console.warn("\nUnexpected slugs (not prod/experimental classification):", partition.unknownOnDisk);
    }
    if (reconciliation.archive.archivedProductionSlugs.length) {
      console.error(
        "\nArchived production slugs:",
        reconciliation.archive.archivedProductionSlugs.join(", "),
      );
    }
    if (reconciliation.archive.manifestMissingOnDisk.length) {
      console.error(
        "\nArchive manifest missing on disk:",
        reconciliation.archive.manifestMissingOnDisk.join(", "),
      );
    }
    if (reconciliation.archive.diskMissingFromManifest.length) {
      console.error(
        "\nArchive disk missing from manifest:",
        reconciliation.archive.diskMissingFromManifest.join(", "),
      );
    }
    console.log(
      "\nProduction slugs:",
      partition.production.join(", ") || "(none)",
    );
  }

  if (partition.missingRoutes.length > 0) {
    process.exitCode = 1;
    return;
  }

  if (
    reconciliation.archive.archivedProductionSlugs.length > 0 ||
    reconciliation.archive.manifestMissingOnDisk.length > 0 ||
    reconciliation.archive.diskMissingFromManifest.length > 0
  ) {
    process.exitCode = 1;
    return;
  }

  if (partition.experimental.length > maxExperimental) {
    console.error(
      `\nExperimental cron count ${partition.experimental.length} exceeds CRON_EXPERIMENTAL_MAX=${maxExperimental}.`,
    );
    console.error("Archive unused routes: npm run cron:archive:experimental (see docs/CRON_ARCHIVE_RUNBOOK.md).");
    process.exitCode = 1;
    return;
  }

  if (!asJson) {
    console.log(`\n✓ Cron inventory OK (${partition.experimental.length} experimental, capped at ${maxExperimental}).`);
  }
}

main();
