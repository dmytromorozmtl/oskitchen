/**
 * Era 124 Forecasting 2.0 orchestrator — 90-day weather holidays wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  FORECASTING_2_ERA124_CYCLE_RUNBOOK_STEPS,
  FORECASTING_2_ERA124_NPM_SCRIPT,
  FORECASTING_2_ERA124_OPS_DOC,
  FORECASTING_2_ERA124_POLICY_ID,
  FORECASTING_2_ERA124_SUMMARY_ARTIFACT,
} from "../lib/ai/forecasting-era124-policy";
import {
  auditForecasting2SmokeWiring,
  buildForecasting2SmokeEra124Summary,
  formatForecasting2SmokeEra124ReportLines,
} from "../lib/ai/forecasting-2-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildForecasting2SmokeEra124Summary>,
): void {
  const path = join(process.cwd(), FORECASTING_2_ERA124_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nForecasting 2.0 smoke (${FORECASTING_2_ERA124_POLICY_ID})\n`);
  for (const [index, step] of FORECASTING_2_ERA124_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${FORECASTING_2_ERA124_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 124 Forecasting 2.0 smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${FORECASTING_2_ERA124_NPM_SCRIPT}] ${FORECASTING_2_ERA124_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:forecasting-2-era124:cert\n");
  const certCode = runNpmScript("test:ci:forecasting-2-era124:cert");

  const wiring = auditForecasting2SmokeWiring(process.cwd());

  const summary = buildForecasting2SmokeEra124Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatForecasting2SmokeEra124ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${FORECASTING_2_ERA124_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
