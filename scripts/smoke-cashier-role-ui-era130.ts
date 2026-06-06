/**
 * Era 130 Cashier Role UI orchestrator — register KPIs cashier briefing wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  CASHIER_ROLE_UI_ERA130_CYCLE_RUNBOOK_STEPS,
  CASHIER_ROLE_UI_ERA130_NPM_SCRIPT,
  CASHIER_ROLE_UI_ERA130_OPS_DOC,
  CASHIER_ROLE_UI_ERA130_POLICY_ID,
  CASHIER_ROLE_UI_ERA130_SUMMARY_ARTIFACT,
} from "../lib/roles/cashier-role-ui-era130-policy";
import {
  auditCashierRoleUiSmokeWiring,
  buildCashierRoleUiSmokeEra130Summary,
  formatCashierRoleUiSmokeEra130ReportLines,
} from "../lib/roles/cashier-role-ui-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildCashierRoleUiSmokeEra130Summary>,
): void {
  const path = join(process.cwd(), CASHIER_ROLE_UI_ERA130_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nCashier Role UI smoke (${CASHIER_ROLE_UI_ERA130_POLICY_ID})\n`);
  for (const [index, step] of CASHIER_ROLE_UI_ERA130_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${CASHIER_ROLE_UI_ERA130_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 130 Cashier Role UI smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${CASHIER_ROLE_UI_ERA130_NPM_SCRIPT}] ${CASHIER_ROLE_UI_ERA130_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:cashier-role-ui-era130:cert\n");
  const certCode = runNpmScript("test:ci:cashier-role-ui-era130:cert");

  const wiring = auditCashierRoleUiSmokeWiring(process.cwd());

  const summary = buildCashierRoleUiSmokeEra130Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatCashierRoleUiSmokeEra130ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${CASHIER_ROLE_UI_ERA130_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
