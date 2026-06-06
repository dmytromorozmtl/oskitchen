/**
 * Era 123 CRM Automation orchestrator — win-back birthday favorites wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  CRM_AUTOMATION_ERA123_CYCLE_RUNBOOK_STEPS,
  CRM_AUTOMATION_ERA123_NPM_SCRIPT,
  CRM_AUTOMATION_ERA123_OPS_DOC,
  CRM_AUTOMATION_ERA123_POLICY_ID,
  CRM_AUTOMATION_ERA123_SUMMARY_ARTIFACT,
} from "../lib/crm/crm-automation-era123-policy";
import {
  auditCrmAutomationSmokeWiring,
  buildCrmAutomationSmokeEra123Summary,
  formatCrmAutomationSmokeEra123ReportLines,
} from "../lib/crm/crm-automation-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildCrmAutomationSmokeEra123Summary>,
): void {
  const path = join(process.cwd(), CRM_AUTOMATION_ERA123_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nCRM Automation smoke (${CRM_AUTOMATION_ERA123_POLICY_ID})\n`);
  for (const [index, step] of CRM_AUTOMATION_ERA123_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${CRM_AUTOMATION_ERA123_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 123 CRM Automation smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${CRM_AUTOMATION_ERA123_NPM_SCRIPT}] ${CRM_AUTOMATION_ERA123_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:crm-automation-era123:cert\n");
  const certCode = runNpmScript("test:ci:crm-automation-era123:cert");

  const wiring = auditCrmAutomationSmokeWiring(process.cwd());

  const summary = buildCrmAutomationSmokeEra123Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatCrmAutomationSmokeEra123ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${CRM_AUTOMATION_ERA123_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
