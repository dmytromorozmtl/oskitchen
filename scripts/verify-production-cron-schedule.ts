/**
 * P0-1 — Verify production Vercel cron schedule + critical cron wiring.
 *
 * Local (CI): reconciles manifest ↔ vercel.json ↔ on-disk routes.
 * Live (ops): set APP_URL + CRON_SECRET to probe /api/health and webhook-jobs?dryRun=1.
 *
 * Usage:
 *   npm run verify:production-cron-schedule
 *   APP_URL=https://app.example CRON_SECRET=... npm run verify:production-cron-schedule
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  formatProductionCronReconciliationFailures,
  reconcileProductionCronState,
} from "@/services/cron/cron-reconciliation";
import { verifyProductionCronSchedule } from "@/lib/cron/verify-production-cron-schedule";

const ARTIFACT_PATH = join(process.cwd(), "artifacts/production-cron-schedule-verification.json");

async function main(): Promise<void> {
  const report = await verifyProductionCronSchedule();
  const reconciliation = reconcileProductionCronState();

  mkdirSync(join(process.cwd(), "artifacts"), { recursive: true });
  writeFileSync(
    ARTIFACT_PATH,
    `${JSON.stringify(
      {
        ...report,
        reconciliation: {
          ok: reconciliation.ok,
          failures: formatProductionCronReconciliationFailures(reconciliation),
        },
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  console.log("");
  console.log("Production cron schedule verification");
  console.log(`  Artifact: ${ARTIFACT_PATH.replace(process.cwd(), ".")}`);
  console.log(`  Reconciliation: ${reconciliation.ok ? "OK" : "FAIL"}`);
  console.log("  Critical crons (P0-1):");
  for (const row of report.criticalCrons) {
    const status = row.inVercelJson && row.scheduleMatch ? "OK" : "FAIL";
    console.log(`    ${status} ${row.slug} @ ${row.schedule}`);
  }

  if (report.liveProbe.attempted) {
    console.log(`  Live probe: ${report.liveProbe.appUrl}`);
    if (report.liveProbe.health) {
      console.log(
        `    /api/health → ${report.liveProbe.health.status} cronExecution.ok=${report.liveProbe.health.cronExecutionOk}`,
      );
    }
    if (report.liveProbe.webhookJobsDryRun) {
      console.log(
        `    webhook-jobs?dryRun=1 → ${report.liveProbe.webhookJobsDryRun.status} ok=${report.liveProbe.webhookJobsDryRun.ok}`,
      );
    }
  } else {
    console.log("  Live probe: skipped (set APP_URL + CRON_SECRET for production heartbeat check)");
  }

  if (report.failures.length > 0) {
    console.log("");
    console.error("Failures:");
    for (const failure of report.failures) {
      console.error(`  - ${failure.split("\n")[0]}`);
    }
    console.error("");
    console.error("Fix: npm run vercel:crons:production && redeploy; ensure CRON_SECRET is set on Vercel.");
    process.exit(1);
  }

  console.log("");
  console.log("✓ Production cron schedule verification OK");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
