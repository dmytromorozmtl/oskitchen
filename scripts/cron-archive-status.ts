import { readCronArchiveManifest, cronArchiveStatus } from "../services/cron/cron-archive";
import { partitionCronRouteSlugs } from "../services/cron/cron-route-inventory";
import { listCronRouteSlugsFromDisk } from "../services/cron/cron-route-inventory";

const asJson = process.argv.includes("--json");

function main() {
  const status = cronArchiveStatus();
  const manifest = readCronArchiveManifest();
  const partition = partitionCronRouteSlugs(listCronRouteSlugsFromDisk());

  const report = {
    ...status,
    manifestArchivedAt: manifest.archivedAt,
    manifestSlugCount: manifest.slugs.length,
    productionOnDisk: partition.production,
    missingProduction: partition.missingRoutes,
  };

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log("=== Cron archive status ===\n");
  console.log(`Active routes: ${status.activeTotal}`);
  console.log(`  production: ${status.activeProduction}`);
  console.log(`  experimental: ${status.activeExperimental}`);
  console.log(`Archived on disk: ${status.archivedTotal} (manifest: ${status.manifestSlugs} slugs)`);
  if (manifest.archivedAt) console.log(`Last archive: ${manifest.archivedAt}`);
  if (partition.missingRoutes.length) {
    console.error("\nMissing production routes:", partition.missingRoutes.join(", "));
    process.exitCode = 1;
  }
}

main();
