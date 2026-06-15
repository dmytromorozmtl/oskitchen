/**
 * Thin audit wrapper around the existing production cron reconciliation logic.
 * Fails when `vercel.json`, the production profile, route inventory, and
 * manifest diverge.
 */
import { reconcileProductionCronState } from "../services/cron/cron-reconciliation";

function main(): void {
  const report = reconcileProductionCronState();

  if (report.ok) {
    console.log(
      `OK — production cron allowlist reconciled (${report.manifest.allowlistedSlugs.length} routes, ${report.routes.experimentalCount} experimental active on disk).`,
    );
    return;
  }

  console.error("FAIL — production cron allowlist mismatch detected.");
  if (report.routes.missingProductionRoutes.length > 0) {
    console.error(`missing routes: ${report.routes.missingProductionRoutes.join(", ")}`);
  }
  if (report.vercelJson.missingPaths.length > 0 || report.vercelJson.extraPaths.length > 0) {
    console.error(
      `vercel.json diff: missing=[${report.vercelJson.missingPaths.join(", ")}] extra=[${report.vercelJson.extraPaths.join(", ")}]`,
    );
  }
  if (
    report.productionProfile.missingPaths.length > 0 ||
    report.productionProfile.extraPaths.length > 0
  ) {
    console.error(
      `crons-production diff: missing=[${report.productionProfile.missingPaths.join(", ")}] extra=[${report.productionProfile.extraPaths.join(", ")}]`,
    );
  }
  process.exit(1);
}

main();
