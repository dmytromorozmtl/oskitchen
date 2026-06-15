/**
 * Era 200 Analytics Suite orchestrator — Round 2 wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  auditAnalyticsSuiteSmokeEra200Wiring,
  buildAnalyticsSuiteSmokeEra200Summary,
  formatAnalyticsSuiteSmokeEra200ReportLines,
} from "../lib/analytics/analytics-suite-era200-smoke-summary";
import {
  ANALYTICS_SUITE_ERA200_CYCLE_RUNBOOK_STEPS,
  ANALYTICS_SUITE_ERA200_NPM_SCRIPT,
  ANALYTICS_SUITE_ERA200_OPS_DOC,
  ANALYTICS_SUITE_ERA200_POLICY_ID,
  ANALYTICS_SUITE_ERA200_SUMMARY_ARTIFACT,
} from "../lib/analytics/analytics-suite-era200-policy";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildAnalyticsSuiteSmokeEra200Summary>,
): void {
  const path = join(process.cwd(), ANALYTICS_SUITE_ERA200_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nAnalytics Suite (${ANALYTICS_SUITE_ERA200_POLICY_ID})\n`);
  for (const [index, step] of ANALYTICS_SUITE_ERA200_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${ANALYTICS_SUITE_ERA200_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 200 Analytics Suite smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${ANALYTICS_SUITE_ERA200_NPM_SCRIPT}] ${ANALYTICS_SUITE_ERA200_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:analytics-suite-era200:cert\n");
  const certCode = runNpmScript("test:ci:analytics-suite-era200:cert");

  const wiring = auditAnalyticsSuiteSmokeEra200Wiring(process.cwd());

  const summary = buildAnalyticsSuiteSmokeEra200Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatAnalyticsSuiteSmokeEra200ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${ANALYTICS_SUITE_ERA200_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
