/**
 * Era 174 POS Customer Display orchestrator — second-screen Round 2 wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  POS_CUSTOMER_DISPLAY_ERA174_CYCLE_RUNBOOK_STEPS,
  POS_CUSTOMER_DISPLAY_ERA174_NPM_SCRIPT,
  POS_CUSTOMER_DISPLAY_ERA174_OPS_DOC,
  POS_CUSTOMER_DISPLAY_ERA174_POLICY_ID,
  POS_CUSTOMER_DISPLAY_ERA174_SUMMARY_ARTIFACT,
} from "../lib/pos/pos-customer-display-era174-policy";
import {
  auditPosCustomerDisplaySmokeEra174Wiring,
  buildPosCustomerDisplaySmokeEra174Summary,
  formatPosCustomerDisplaySmokeEra174ReportLines,
} from "../lib/pos/pos-customer-display-era174-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildPosCustomerDisplaySmokeEra174Summary>,
): void {
  const path = join(process.cwd(), POS_CUSTOMER_DISPLAY_ERA174_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nPOS Customer Display (${POS_CUSTOMER_DISPLAY_ERA174_POLICY_ID})\n`);
  for (const [index, step] of POS_CUSTOMER_DISPLAY_ERA174_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${POS_CUSTOMER_DISPLAY_ERA174_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 174 POS Customer Display smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(
    `\n[${POS_CUSTOMER_DISPLAY_ERA174_NPM_SCRIPT}] ${POS_CUSTOMER_DISPLAY_ERA174_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:pos-customer-display-era174:cert\n");
  const certCode = runNpmScript("test:ci:pos-customer-display-era174:cert");

  const wiring = auditPosCustomerDisplaySmokeEra174Wiring(process.cwd());

  const summary = buildPosCustomerDisplaySmokeEra174Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatPosCustomerDisplaySmokeEra174ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${POS_CUSTOMER_DISPLAY_ERA174_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
