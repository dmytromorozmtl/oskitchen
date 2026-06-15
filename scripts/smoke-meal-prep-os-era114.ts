/**
 * Era 114 Meal Prep OS orchestrator — four-module wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  MEAL_PREP_OS_ERA114_CYCLE_RUNBOOK_STEPS,
  MEAL_PREP_OS_ERA114_NPM_SCRIPT,
  MEAL_PREP_OS_ERA114_OPS_DOC,
  MEAL_PREP_OS_ERA114_POLICY_ID,
  MEAL_PREP_OS_ERA114_SUMMARY_ARTIFACT,
} from "../lib/meal-prep/meal-prep-os-era114-policy";
import {
  auditMealPrepOsSmokeWiring,
  buildMealPrepOsSmokeEra114Summary,
  formatMealPrepOsSmokeEra114ReportLines,
} from "../lib/meal-prep/meal-prep-os-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildMealPrepOsSmokeEra114Summary>,
): void {
  const path = join(process.cwd(), MEAL_PREP_OS_ERA114_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nMeal Prep OS smoke (${MEAL_PREP_OS_ERA114_POLICY_ID})\n`);
  for (const [index, step] of MEAL_PREP_OS_ERA114_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${MEAL_PREP_OS_ERA114_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 114 Meal Prep OS smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${MEAL_PREP_OS_ERA114_NPM_SCRIPT}] ${MEAL_PREP_OS_ERA114_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:meal-prep-os-era114:cert\n");
  const certCode = runNpmScript("test:ci:meal-prep-os-era114:cert");

  const wiring = auditMealPrepOsSmokeWiring(process.cwd());

  const summary = buildMealPrepOsSmokeEra114Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatMealPrepOsSmokeEra114ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${MEAL_PREP_OS_ERA114_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
