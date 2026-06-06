/**
 * Era 112 Commissary OS orchestrator — four-pillar wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  COMMISSARY_OS_ERA112_CYCLE_RUNBOOK_STEPS,
  COMMISSARY_OS_ERA112_NPM_SCRIPT,
  COMMISSARY_OS_ERA112_OPS_DOC,
  COMMISSARY_OS_ERA112_POLICY_ID,
  COMMISSARY_OS_ERA112_SUMMARY_ARTIFACT,
} from "../lib/enterprise/commissary-os-era112-policy";
import {
  auditCommissaryOsSmokeWiring,
  buildCommissaryOsSmokeEra112Summary,
  formatCommissaryOsSmokeEra112ReportLines,
} from "../lib/enterprise/commissary-os-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildCommissaryOsSmokeEra112Summary>,
): void {
  const path = join(process.cwd(), COMMISSARY_OS_ERA112_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nCommissary OS smoke (${COMMISSARY_OS_ERA112_POLICY_ID})\n`);
  for (const [index, step] of COMMISSARY_OS_ERA112_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${COMMISSARY_OS_ERA112_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 112 Commissary OS smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${COMMISSARY_OS_ERA112_NPM_SCRIPT}] ${COMMISSARY_OS_ERA112_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:commissary-os-era112:cert\n");
  const certCode = runNpmScript("test:ci:commissary-os-era112:cert");

  const wiring = auditCommissaryOsSmokeWiring(process.cwd());

  const summary = buildCommissaryOsSmokeEra112Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatCommissaryOsSmokeEra112ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${COMMISSARY_OS_ERA112_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
