/**
 * Era 192 Vendor Portal 2.0 orchestrator — Round 2 wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  VENDOR_PORTAL_ERA192_CYCLE_RUNBOOK_STEPS,
  VENDOR_PORTAL_ERA192_NPM_SCRIPT,
  VENDOR_PORTAL_ERA192_OPS_DOC,
  VENDOR_PORTAL_ERA192_POLICY_ID,
  VENDOR_PORTAL_ERA192_SUMMARY_ARTIFACT,
} from "../lib/marketplace/vendor-portal-era192-policy";
import {
  auditVendorPortalSmokeEra192Wiring,
  buildVendorPortalSmokeEra192Summary,
  formatVendorPortalSmokeEra192ReportLines,
} from "../lib/marketplace/vendor-portal-era192-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildVendorPortalSmokeEra192Summary>,
): void {
  const path = join(process.cwd(), VENDOR_PORTAL_ERA192_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nVendor Portal 2.0 (${VENDOR_PORTAL_ERA192_POLICY_ID})\n`);
  for (const [index, step] of VENDOR_PORTAL_ERA192_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${VENDOR_PORTAL_ERA192_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 192 Vendor Portal 2.0 smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${VENDOR_PORTAL_ERA192_NPM_SCRIPT}] ${VENDOR_PORTAL_ERA192_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:vendor-portal-era192:cert\n");
  const certCode = runNpmScript("test:ci:vendor-portal-era192:cert");

  const wiring = auditVendorPortalSmokeEra192Wiring(process.cwd());

  const summary = buildVendorPortalSmokeEra192Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatVendorPortalSmokeEra192ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${VENDOR_PORTAL_ERA192_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
