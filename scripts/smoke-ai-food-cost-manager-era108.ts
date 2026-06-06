/**
 * Era 108 AI Food Cost Manager orchestrator — margin + profit + price rec wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  AI_FOOD_COST_MANAGER_ERA108_CYCLE_RUNBOOK_STEPS,
  AI_FOOD_COST_MANAGER_ERA108_NPM_SCRIPT,
  AI_FOOD_COST_MANAGER_ERA108_OPS_DOC,
  AI_FOOD_COST_MANAGER_ERA108_POLICY_ID,
  AI_FOOD_COST_MANAGER_ERA108_SUMMARY_ARTIFACT,
} from "../lib/ai/food-cost-manager-era108-policy";
import {
  auditAiFoodCostManagerSmokeWiring,
  buildAiFoodCostManagerSmokeEra108Summary,
  formatAiFoodCostManagerSmokeEra108ReportLines,
} from "../lib/ai/food-cost-manager-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildAiFoodCostManagerSmokeEra108Summary>,
): void {
  const path = join(process.cwd(), AI_FOOD_COST_MANAGER_ERA108_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nAI Food Cost Manager smoke (${AI_FOOD_COST_MANAGER_ERA108_POLICY_ID})\n`);
  for (const [index, step] of AI_FOOD_COST_MANAGER_ERA108_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${AI_FOOD_COST_MANAGER_ERA108_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 108 AI Food Cost Manager smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(
    `\n[${AI_FOOD_COST_MANAGER_ERA108_NPM_SCRIPT}] ${AI_FOOD_COST_MANAGER_ERA108_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:ai-food-cost-manager-era108:cert\n");
  const certCode = runNpmScript("test:ci:ai-food-cost-manager-era108:cert");

  const wiring = auditAiFoodCostManagerSmokeWiring(process.cwd());

  const summary = buildAiFoodCostManagerSmokeEra108Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatAiFoodCostManagerSmokeEra108ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${AI_FOOD_COST_MANAGER_ERA108_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
