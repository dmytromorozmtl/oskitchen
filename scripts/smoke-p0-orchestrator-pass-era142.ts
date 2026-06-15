/**
 * Era 142 P0 orchestrator PASS orchestrator — vault gate child smokes wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  P0_ORCHESTRATOR_PASS_ERA142_CYCLE_RUNBOOK_STEPS,
  P0_ORCHESTRATOR_PASS_ERA142_NPM_SCRIPT,
  P0_ORCHESTRATOR_PASS_ERA142_OPS_DOC,
  P0_ORCHESTRATOR_PASS_ERA142_POLICY_ID,
  P0_ORCHESTRATOR_PASS_ERA142_SUMMARY_ARTIFACT,
} from "../lib/ops/p0-orchestrator-pass-era142-policy";
import {
  auditP0OrchestratorPassSmokeWiring,
  buildP0OrchestratorPassSmokeEra142Summary,
  formatP0OrchestratorPassSmokeEra142ReportLines,
} from "../lib/ops/p0-orchestrator-pass-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildP0OrchestratorPassSmokeEra142Summary>,
): void {
  const path = join(process.cwd(), P0_ORCHESTRATOR_PASS_ERA142_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nP0 orchestrator PASS smoke (${P0_ORCHESTRATOR_PASS_ERA142_POLICY_ID})\n`);
  for (const [index, step] of P0_ORCHESTRATOR_PASS_ERA142_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${P0_ORCHESTRATOR_PASS_ERA142_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 142 P0 orchestrator PASS smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${P0_ORCHESTRATOR_PASS_ERA142_NPM_SCRIPT}] ${P0_ORCHESTRATOR_PASS_ERA142_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:p0-orchestrator-pass-era142:cert\n");
  const certCode = runNpmScript("test:ci:p0-orchestrator-pass-era142:cert");

  const wiring = auditP0OrchestratorPassSmokeWiring(process.cwd());

  const summary = buildP0OrchestratorPassSmokeEra142Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatP0OrchestratorPassSmokeEra142ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${P0_ORCHESTRATOR_PASS_ERA142_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
