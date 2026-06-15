/**
 * Era 117 Vendor Portal 2.0 orchestrator — three-module wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  VENDOR_PORTAL_ERA117_CYCLE_RUNBOOK_STEPS,
  VENDOR_PORTAL_ERA117_NPM_SCRIPT,
  VENDOR_PORTAL_ERA117_OPS_DOC,
  VENDOR_PORTAL_ERA117_POLICY_ID,
  VENDOR_PORTAL_ERA117_SUMMARY_ARTIFACT,
} from "../lib/marketplace/vendor-portal-era117-policy";
import {
  auditVendorPortalSmokeWiring,
  buildVendorPortalSmokeEra117Summary,
  formatVendorPortalSmokeEra117ReportLines,
} from "../lib/marketplace/vendor-portal-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildVendorPortalSmokeEra117Summary>,
): void {
  const path = join(process.cwd(), VENDOR_PORTAL_ERA117_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nVendor Portal 2.0 smoke (${VENDOR_PORTAL_ERA117_POLICY_ID})\n`);
  for (const [index, step] of VENDOR_PORTAL_ERA117_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${VENDOR_PORTAL_ERA117_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 117 Vendor Portal 2.0 smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${VENDOR_PORTAL_ERA117_NPM_SCRIPT}] ${VENDOR_PORTAL_ERA117_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:vendor-portal-era117:cert\n");
  const certCode = runNpmScript("test:ci:vendor-portal-era117:cert");

  const wiring = auditVendorPortalSmokeWiring(process.cwd());

  const summary = buildVendorPortalSmokeEra117Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatVendorPortalSmokeEra117ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${VENDOR_PORTAL_ERA117_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
