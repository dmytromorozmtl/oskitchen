/**
 * Era 199 Forecasting 2.0 orchestrator — Round 2 wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  buildForecasting2SmokeEra199Summary,
  auditForecasting2SmokeEra199Wiring,
  formatForecasting2SmokeEra199ReportLines,
} from "../lib/ai/forecasting-2-era199-smoke-summary";
import {
  FORECASTING_2_ERA199_CYCLE_RUNBOOK_STEPS,
  FORECASTING_2_ERA199_NPM_SCRIPT,
  FORECASTING_2_ERA199_OPS_DOC,
  FORECASTING_2_ERA199_POLICY_ID,
  FORECASTING_2_ERA199_SUMMARY_ARTIFACT,
} from "../lib/ai/forecasting-era199-policy";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildForecasting2SmokeEra199Summary>,
): void {
  const path = join(process.cwd(), FORECASTING_2_ERA199_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nForecasting 2.0 (${FORECASTING_2_ERA199_POLICY_ID})\n`);
  for (const [index, step] of FORECASTING_2_ERA199_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${FORECASTING_2_ERA199_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 199 Forecasting 2.0 smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${FORECASTING_2_ERA199_NPM_SCRIPT}] ${FORECASTING_2_ERA199_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:forecasting-2-era199:cert\n");
  const certCode = runNpmScript("test:ci:forecasting-2-era199:cert");

  const wiring = auditForecasting2SmokeEra199Wiring(process.cwd());

  const summary = buildForecasting2SmokeEra199Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatForecasting2SmokeEra199ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${FORECASTING_2_ERA199_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
