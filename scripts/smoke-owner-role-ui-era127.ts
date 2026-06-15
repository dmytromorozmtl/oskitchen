/**
 * Era 127 Owner Role UI orchestrator — leadership KPIs briefing shortcuts wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  OWNER_ROLE_UI_ERA127_CYCLE_RUNBOOK_STEPS,
  OWNER_ROLE_UI_ERA127_NPM_SCRIPT,
  OWNER_ROLE_UI_ERA127_OPS_DOC,
  OWNER_ROLE_UI_ERA127_POLICY_ID,
  OWNER_ROLE_UI_ERA127_SUMMARY_ARTIFACT,
} from "../lib/roles/owner-role-ui-era127-policy";
import {
  auditOwnerRoleUiSmokeWiring,
  buildOwnerRoleUiSmokeEra127Summary,
  formatOwnerRoleUiSmokeEra127ReportLines,
} from "../lib/roles/owner-role-ui-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildOwnerRoleUiSmokeEra127Summary>,
): void {
  const path = join(process.cwd(), OWNER_ROLE_UI_ERA127_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nOwner Role UI smoke (${OWNER_ROLE_UI_ERA127_POLICY_ID})\n`);
  for (const [index, step] of OWNER_ROLE_UI_ERA127_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${OWNER_ROLE_UI_ERA127_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 127 Owner Role UI smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${OWNER_ROLE_UI_ERA127_NPM_SCRIPT}] ${OWNER_ROLE_UI_ERA127_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:owner-role-ui-era127:cert\n");
  const certCode = runNpmScript("test:ci:owner-role-ui-era127:cert");

  const wiring = auditOwnerRoleUiSmokeWiring(process.cwd());

  const summary = buildOwnerRoleUiSmokeEra127Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatOwnerRoleUiSmokeEra127ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${OWNER_ROLE_UI_ERA127_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
