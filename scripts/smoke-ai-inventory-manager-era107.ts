/**
 * Era 107 AI Inventory Manager orchestrator — waste + theft + shrinkage wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  AI_INVENTORY_MANAGER_ERA107_CYCLE_RUNBOOK_STEPS,
  AI_INVENTORY_MANAGER_ERA107_NPM_SCRIPT,
  AI_INVENTORY_MANAGER_ERA107_OPS_DOC,
  AI_INVENTORY_MANAGER_ERA107_POLICY_ID,
  AI_INVENTORY_MANAGER_ERA107_SUMMARY_ARTIFACT,
} from "../lib/ai/inventory-manager-era107-policy";
import {
  auditAiInventoryManagerSmokeWiring,
  buildAiInventoryManagerSmokeEra107Summary,
  formatAiInventoryManagerSmokeEra107ReportLines,
} from "../lib/ai/inventory-manager-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildAiInventoryManagerSmokeEra107Summary>,
): void {
  const path = join(process.cwd(), AI_INVENTORY_MANAGER_ERA107_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nAI Inventory Manager smoke (${AI_INVENTORY_MANAGER_ERA107_POLICY_ID})\n`);
  for (const [index, step] of AI_INVENTORY_MANAGER_ERA107_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${AI_INVENTORY_MANAGER_ERA107_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 107 AI Inventory Manager smoke

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
    `\n[${AI_INVENTORY_MANAGER_ERA107_NPM_SCRIPT}] ${AI_INVENTORY_MANAGER_ERA107_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:ai-inventory-manager-era107:cert\n");
  const certCode = runNpmScript("test:ci:ai-inventory-manager-era107:cert");

  const wiring = auditAiInventoryManagerSmokeWiring(process.cwd());

  const summary = buildAiInventoryManagerSmokeEra107Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatAiInventoryManagerSmokeEra107ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${AI_INVENTORY_MANAGER_ERA107_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
