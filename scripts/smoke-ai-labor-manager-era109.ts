/**
 * Era 109 AI Labor Manager orchestrator — staffing + overtime wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  AI_LABOR_MANAGER_ERA109_CYCLE_RUNBOOK_STEPS,
  AI_LABOR_MANAGER_ERA109_NPM_SCRIPT,
  AI_LABOR_MANAGER_ERA109_OPS_DOC,
  AI_LABOR_MANAGER_ERA109_POLICY_ID,
  AI_LABOR_MANAGER_ERA109_SUMMARY_ARTIFACT,
} from "../lib/ai/labor-manager-era109-policy";
import {
  auditAiLaborManagerSmokeWiring,
  buildAiLaborManagerSmokeEra109Summary,
  formatAiLaborManagerSmokeEra109ReportLines,
} from "../lib/ai/labor-manager-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildAiLaborManagerSmokeEra109Summary>,
): void {
  const path = join(process.cwd(), AI_LABOR_MANAGER_ERA109_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nAI Labor Manager smoke (${AI_LABOR_MANAGER_ERA109_POLICY_ID})\n`);
  for (const [index, step] of AI_LABOR_MANAGER_ERA109_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${AI_LABOR_MANAGER_ERA109_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 109 AI Labor Manager smoke

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
    `\n[${AI_LABOR_MANAGER_ERA109_NPM_SCRIPT}] ${AI_LABOR_MANAGER_ERA109_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:ai-labor-manager-era109:cert\n");
  const certCode = runNpmScript("test:ci:ai-labor-manager-era109:cert");

  const wiring = auditAiLaborManagerSmokeWiring(process.cwd());

  const summary = buildAiLaborManagerSmokeEra109Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatAiLaborManagerSmokeEra109ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${AI_LABOR_MANAGER_ERA109_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
