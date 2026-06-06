/**
 * Era 182 AI Inventory Manager orchestrator — Round 2 wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  AI_INVENTORY_MANAGER_ERA182_CYCLE_RUNBOOK_STEPS,
  AI_INVENTORY_MANAGER_ERA182_NPM_SCRIPT,
  AI_INVENTORY_MANAGER_ERA182_OPS_DOC,
  AI_INVENTORY_MANAGER_ERA182_POLICY_ID,
  AI_INVENTORY_MANAGER_ERA182_SUMMARY_ARTIFACT,
} from "../lib/ai/inventory-manager-era182-policy";
import {
  auditAiInventoryManagerSmokeEra182Wiring,
  buildAiInventoryManagerSmokeEra182Summary,
  formatAiInventoryManagerSmokeEra182ReportLines,
} from "../lib/ai/inventory-manager-era182-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildAiInventoryManagerSmokeEra182Summary>,
): void {
  const path = join(process.cwd(), AI_INVENTORY_MANAGER_ERA182_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nAI Inventory Manager (${AI_INVENTORY_MANAGER_ERA182_POLICY_ID})\n`);
  for (const [index, step] of AI_INVENTORY_MANAGER_ERA182_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${AI_INVENTORY_MANAGER_ERA182_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 182 AI Inventory Manager smoke

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
    `\n[${AI_INVENTORY_MANAGER_ERA182_NPM_SCRIPT}] ${AI_INVENTORY_MANAGER_ERA182_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:ai-inventory-manager-era182:cert\n");
  const certCode = runNpmScript("test:ci:ai-inventory-manager-era182:cert");

  const wiring = auditAiInventoryManagerSmokeEra182Wiring(process.cwd());

  const summary = buildAiInventoryManagerSmokeEra182Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatAiInventoryManagerSmokeEra182ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${AI_INVENTORY_MANAGER_ERA182_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
