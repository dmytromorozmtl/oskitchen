/**
 * Restore archived experimental cron routes to `app/api/cron/{slug}`.
 *
 *   npm run cron:restore:archived -- --execute
 *   npm run cron:restore:archived -- --execute --slug=nist-ai-rmf-seed
 */
import {
  cronArchiveStatus,
  restoreArchivedCronSlugs,
  resolveSlugsToRestore,
} from "../services/cron/cron-archive";

const execute = process.argv.includes("--execute");
const asJson = process.argv.includes("--json");
const slugArg = process.argv.find((a) => a.startsWith("--slug="));
const singleSlug = slugArg?.slice("--slug=".length).trim();

function main() {
  const planned = resolveSlugsToRestore(singleSlug ? [singleSlug] : undefined);

  if (!execute) {
    const payload = { mode: "dry-run", plannedCount: planned.length, plannedSlugs: planned };
    if (asJson) console.log(JSON.stringify(payload, null, 2));
    else {
      console.log("=== Restore archived crons (dry-run) ===\n");
      console.log(`Would restore ${planned.length} slug(s) to app/api/cron/`);
      if (planned.length) console.log(planned.slice(0, 30).join(", "));
    }
    return;
  }

  const result = restoreArchivedCronSlugs({
    slugs: singleSlug ? [singleSlug] : undefined,
    dryRun: false,
  });
  const status = cronArchiveStatus();

  if (asJson) console.log(JSON.stringify({ result, status }, null, 2));
  else {
    console.log(`Restored: ${result.moved.length}`);
    if (result.errors.length) console.error(result.errors);
    console.log(`Active routes: ${status.activeTotal}`);
  }

  if (result.errors.length) process.exit(1);
}

main();
