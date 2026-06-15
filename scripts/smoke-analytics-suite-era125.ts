/**
 * Era 125 Analytics Suite orchestrator — all metrics one screen wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  ANALYTICS_SUITE_ERA125_CYCLE_RUNBOOK_STEPS,
  ANALYTICS_SUITE_ERA125_NPM_SCRIPT,
  ANALYTICS_SUITE_ERA125_OPS_DOC,
  ANALYTICS_SUITE_ERA125_POLICY_ID,
  ANALYTICS_SUITE_ERA125_SUMMARY_ARTIFACT,
} from "../lib/analytics/analytics-suite-era125-policy";
import {
  auditAnalyticsSuiteSmokeWiring,
  buildAnalyticsSuiteSmokeEra125Summary,
  formatAnalyticsSuiteSmokeEra125ReportLines,
} from "../lib/analytics/analytics-suite-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildAnalyticsSuiteSmokeEra125Summary>,
): void {
  const path = join(process.cwd(), ANALYTICS_SUITE_ERA125_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nAnalytics Suite smoke (${ANALYTICS_SUITE_ERA125_POLICY_ID})\n`);
  for (const [index, step] of ANALYTICS_SUITE_ERA125_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${ANALYTICS_SUITE_ERA125_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 125 Analytics Suite smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${ANALYTICS_SUITE_ERA125_NPM_SCRIPT}] ${ANALYTICS_SUITE_ERA125_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:analytics-suite-era125:cert\n");
  const certCode = runNpmScript("test:ci:analytics-suite-era125:cert");

  const wiring = auditAnalyticsSuiteSmokeWiring(process.cwd());

  const summary = buildAnalyticsSuiteSmokeEra125Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatAnalyticsSuiteSmokeEra125ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${ANALYTICS_SUITE_ERA125_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
