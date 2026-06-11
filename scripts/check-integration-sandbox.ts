/**
 * Print integration sandbox credential readiness for 18 LIVE surfaces.
 *
 * Usage:
 *   npx tsx scripts/check-integration-sandbox.ts
 *   npm run check:integration-sandbox
 */
import { loadSmokeEnv } from "./lib/load-smoke-env";

loadSmokeEnv();

import { INTEGRATION_SANDBOX_RUNBOOK_STEPS } from "@/lib/integrations/integration-sandbox-policy";
import {
  auditIntegrationSandboxReadiness,
  formatIntegrationSandboxReportLines,
} from "@/lib/integrations/integration-sandbox-service";

function main(): void {
  const readiness = auditIntegrationSandboxReadiness(process.env);

  console.log("");
  for (const line of formatIntegrationSandboxReportLines(readiness)) {
    console.log(line);
  }

  console.log("\nRunbook:");
  for (const [index, step] of INTEGRATION_SANDBOX_RUNBOOK_STEPS.entries()) {
    console.log(`  ${index + 1}. ${step}`);
  }
  console.log("");

  if (readiness.merchantConfiguredCount === 0 && readiness.sharedMissing.length > 0) {
    process.exit(0);
  }
  process.exit(0);
}

main();
