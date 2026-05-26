/**
 * CI/predeploy check: production cron manifest, active routes, archive state,
 * generated profile, and vercel.json must reconcile.
 */
import { reconcileProductionCronState } from "../services/cron/cron-reconciliation";

function printList(label: string, values: string[]): void {
  if (values.length === 0) return;
  console.error(`  ${label}: ${values.join(", ")}`);
}

function main(): void {
  const report = reconcileProductionCronState();

  if (!report.ok) {
    console.error("production cron reconciliation failed");
    printList("manifest missing schedules", report.manifest.missingSchedules);
    printList("manifest extra schedule keys", report.manifest.extraScheduleKeys);
    printList("missing production routes on disk", report.routes.missingProductionRoutes);
    printList("archived production routes", report.archive.archivedProductionSlugs);
    printList("archive manifest missing on disk", report.archive.manifestMissingOnDisk);
    printList("archive disk missing from manifest", report.archive.diskMissingFromManifest);
    if (!report.vercelJson.present) {
      console.error("  vercel.json crons: missing");
    } else {
      printList("vercel.json missing paths", report.vercelJson.missingPaths);
      printList("vercel.json extra paths", report.vercelJson.extraPaths);
      printList("vercel.json duplicate paths", report.vercelJson.duplicatePaths);
      for (const mismatch of report.vercelJson.scheduleMismatches) {
        console.error(
          `  vercel.json schedule mismatch ${mismatch.path}: actual=${mismatch.actual} expected=${mismatch.expected}`,
        );
      }
    }
    if (!report.productionProfile.present) {
      console.error("  config/vercel/crons-production.json: missing");
    } else {
      printList("production profile missing paths", report.productionProfile.missingPaths);
      printList("production profile extra paths", report.productionProfile.extraPaths);
      printList("production profile duplicate paths", report.productionProfile.duplicatePaths);
      for (const mismatch of report.productionProfile.scheduleMismatches) {
        console.error(
          `  production profile schedule mismatch ${mismatch.path}: actual=${mismatch.actual} expected=${mismatch.expected}`,
        );
      }
    }
    console.error("\nFix: npm run vercel:crons:production");
    process.exitCode = 1;
    return;
  }

  console.log(
    `✓ production cron reconciliation OK (${report.manifest.allowlistedSlugs.length} allowlisted, ${report.routes.experimentalCount} experimental active)`,
  );
}

main();
