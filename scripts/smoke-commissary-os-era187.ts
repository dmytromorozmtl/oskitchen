/**
 * Era 187 Commissary OS orchestrator — Round 2 wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  COMMISSARY_OS_ERA187_CYCLE_RUNBOOK_STEPS,
  COMMISSARY_OS_ERA187_NPM_SCRIPT,
  COMMISSARY_OS_ERA187_OPS_DOC,
  COMMISSARY_OS_ERA187_POLICY_ID,
  COMMISSARY_OS_ERA187_SUMMARY_ARTIFACT,
} from "../lib/enterprise/commissary-os-era187-policy";
import {
  auditCommissaryOsSmokeEra187Wiring,
  buildCommissaryOsSmokeEra187Summary,
  formatCommissaryOsSmokeEra187ReportLines,
} from "../lib/enterprise/commissary-os-era187-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildCommissaryOsSmokeEra187Summary>,
): void {
  const path = join(process.cwd(), COMMISSARY_OS_ERA187_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nCommissary OS (${COMMISSARY_OS_ERA187_POLICY_ID})\n`);
  for (const [index, step] of COMMISSARY_OS_ERA187_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${COMMISSARY_OS_ERA187_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 187 Commissary OS smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${COMMISSARY_OS_ERA187_NPM_SCRIPT}] ${COMMISSARY_OS_ERA187_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:commissary-os-era187:cert\n");
  const certCode = runNpmScript("test:ci:commissary-os-era187:cert");

  const wiring = auditCommissaryOsSmokeEra187Wiring(process.cwd());

  const summary = buildCommissaryOsSmokeEra187Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatCommissaryOsSmokeEra187ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${COMMISSARY_OS_ERA187_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
