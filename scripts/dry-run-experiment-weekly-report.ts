#!/usr/bin/env tsx
/**
 * Dry-run weekly experiment CSV email (no send unless --send).
 * Run: npm run ops:dry-run-experiment-weekly-report
 * Send: npm run ops:dry-run-experiment-weekly-report -- --send
 */

import { sendWeeklyExperimentReports } from "@/services/storefront/experiment-weekly-report-service";

const send = process.argv.includes("--send");

async function main() {
  if (!send) {
    console.log(
      JSON.stringify(
        {
          mode: "dry_run",
          hint: "Pass --send to dispatch emails (requires RESEND_API_KEY).",
        },
        null,
        2,
      ),
    );
    return;
  }

  const stats = await sendWeeklyExperimentReports();
  console.log(JSON.stringify({ mode: "send", ...stats }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
