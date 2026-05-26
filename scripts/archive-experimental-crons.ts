/**
 * Move experimental `/api/cron/*` route folders off the App Router tree.
 *
 * Default: dry-run (prints plan only).
 * Execute: `npm run cron:archive:experimental -- --execute`
 *
 * Requires CONFIRM_CRON_ARCHIVE=1 when archiving >0 routes without --slug.
 *
 * @see docs/CRON_ARCHIVE_RUNBOOK.md
 */
import {
  archiveExperimentalCronSlugs,
  cronArchiveStatus,
  missingProductionCronsOnDisk,
  resolveSlugsToArchive,
} from "../services/cron/cron-archive";
import {
  listCronRouteSlugsFromDisk,
  partitionCronRouteSlugs,
} from "../services/cron/cron-route-inventory";

const execute = process.argv.includes("--execute");
const asJson = process.argv.includes("--json");
const slugArg = process.argv.find((a) => a.startsWith("--slug="));
const singleSlug = slugArg?.slice("--slug=".length).trim();

function main() {
  const missingProd = missingProductionCronsOnDisk();
  if (missingProd.length) {
    console.error("Abort: production cron routes missing on disk:", missingProd.join(", "));
    process.exit(1);
  }

  const planned = resolveSlugsToArchive(singleSlug ? [singleSlug] : undefined);
  const statusBefore = cronArchiveStatus();

  if (!execute) {
    const payload = {
      mode: "dry-run",
      plannedCount: planned.length,
      plannedSlugs: planned,
      status: statusBefore,
      partition: partitionCronRouteSlugs(listCronRouteSlugsFromDisk()),
    };
    if (asJson) {
      console.log(JSON.stringify(payload, null, 2));
    } else {
      console.log("=== Experimental cron archive (dry-run) ===\n");
      console.log(`Would move ${planned.length} slug(s) to archive/cron-routes/`);
      console.log(`Active on disk: ${statusBefore.activeTotal} (${statusBefore.activeExperimental} experimental)`);
      console.log(`Already archived: ${statusBefore.archivedTotal}`);
      if (planned.length) {
        console.log("\nFirst 20 slugs:", planned.slice(0, 20).join(", "));
        if (planned.length > 20) console.log(`… and ${planned.length - 20} more`);
      }
      console.log("\nRe-run with --execute after 2 weeks of zero prod 404s on experimental crons.");
      console.log("Bulk execute also requires: CONFIRM_CRON_ARCHIVE=1");
    }
    return;
  }

  if (!singleSlug && planned.length > 0 && process.env.CONFIRM_CRON_ARCHIVE !== "1") {
    console.error(
      "Refusing bulk archive without CONFIRM_CRON_ARCHIVE=1 (set after ops sign-off).",
    );
    console.error(`Planned: ${planned.length} experimental route(s).`);
    process.exit(1);
  }

  const result = archiveExperimentalCronSlugs({
    slugs: singleSlug ? [singleSlug] : undefined,
    dryRun: false,
  });
  const statusAfter = cronArchiveStatus();

  const payload = { result, statusAfter };
  if (asJson) {
    console.log(JSON.stringify(payload, null, 2));
  } else {
    console.log("=== Experimental cron archive (executed) ===\n");
    console.log(`Moved: ${result.moved.length}`);
    console.log(`Skipped: ${result.skipped.length}`);
    if (result.errors.length) {
      console.error("Errors:", result.errors);
    }
    console.log(
      `\nActive routes: ${statusAfter.activeTotal} (${statusAfter.activeExperimental} experimental)`,
    );
    console.log(`Archived on disk: ${statusAfter.archivedTotal}`);
  }

  if (result.errors.length) process.exit(1);
}

main();
