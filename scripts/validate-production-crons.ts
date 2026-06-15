/**
 * CI/predeploy check: production cron manifest, active routes, archive state,
 * generated profile, and vercel.json must reconcile.
 */
import {
  assertProductionCronReconciliation,
  reconcileProductionCronState,
} from "../services/cron/cron-reconciliation";

function main(): void {
  const report = assertProductionCronReconciliation();
  console.log(
    `✓ production cron reconciliation OK (${report.manifest.allowlistedSlugs.length} allowlisted, ${report.routes.experimentalCount} experimental active)`,
  );
}

main();
