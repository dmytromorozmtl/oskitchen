/**
 * Era 113 Catering OS orchestrator — four-module wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  CATERING_OS_ERA113_CYCLE_RUNBOOK_STEPS,
  CATERING_OS_ERA113_NPM_SCRIPT,
  CATERING_OS_ERA113_OPS_DOC,
  CATERING_OS_ERA113_POLICY_ID,
  CATERING_OS_ERA113_SUMMARY_ARTIFACT,
} from "../lib/catering/catering-os-era113-policy";
import {
  auditCateringOsSmokeWiring,
  buildCateringOsSmokeEra113Summary,
  formatCateringOsSmokeEra113ReportLines,
} from "../lib/catering/catering-os-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildCateringOsSmokeEra113Summary>,
): void {
  const path = join(process.cwd(), CATERING_OS_ERA113_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nCatering OS smoke (${CATERING_OS_ERA113_POLICY_ID})\n`);
  for (const [index, step] of CATERING_OS_ERA113_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${CATERING_OS_ERA113_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 113 Catering OS smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${CATERING_OS_ERA113_NPM_SCRIPT}] ${CATERING_OS_ERA113_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:catering-os-era113:cert\n");
  const certCode = runNpmScript("test:ci:catering-os-era113:cert");

  const wiring = auditCateringOsSmokeWiring(process.cwd());

  const summary = buildCateringOsSmokeEra113Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatCateringOsSmokeEra113ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${CATERING_OS_ERA113_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
