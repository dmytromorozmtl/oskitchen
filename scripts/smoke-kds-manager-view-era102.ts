/**
 * Era 102 KDS Manager View orchestrator — performance / delays / efficiency wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  KDS_MANAGER_VIEW_ERA102_CYCLE_RUNBOOK_STEPS,
  KDS_MANAGER_VIEW_ERA102_NPM_SCRIPT,
  KDS_MANAGER_VIEW_ERA102_OPS_DOC,
  KDS_MANAGER_VIEW_ERA102_POLICY_ID,
  KDS_MANAGER_VIEW_ERA102_SUMMARY_ARTIFACT,
} from "../lib/kitchen/kds-manager-view-era102-policy";
import {
  auditKdsManagerViewSmokeWiring,
  buildKdsManagerViewSmokeEra102Summary,
  formatKdsManagerViewSmokeEra102ReportLines,
} from "../lib/kitchen/kds-manager-view-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildKdsManagerViewSmokeEra102Summary>,
): void {
  const path = join(process.cwd(), KDS_MANAGER_VIEW_ERA102_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nKDS Manager View smoke (${KDS_MANAGER_VIEW_ERA102_POLICY_ID})\n`);
  for (const [index, step] of KDS_MANAGER_VIEW_ERA102_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${KDS_MANAGER_VIEW_ERA102_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 102 KDS Manager View smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${KDS_MANAGER_VIEW_ERA102_NPM_SCRIPT}] ${KDS_MANAGER_VIEW_ERA102_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:kds-manager-view-era102:cert\n");
  const certCode = runNpmScript("test:ci:kds-manager-view-era102:cert");

  const wiring = auditKdsManagerViewSmokeWiring(process.cwd());

  const summary = buildKdsManagerViewSmokeEra102Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatKdsManagerViewSmokeEra102ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${KDS_MANAGER_VIEW_ERA102_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
