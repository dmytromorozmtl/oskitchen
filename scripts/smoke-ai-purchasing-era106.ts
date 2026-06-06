/**
 * Era 106 AI Purchasing Manager orchestrator — shortage + price + daily brief wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  AI_PURCHASING_ERA106_CYCLE_RUNBOOK_STEPS,
  AI_PURCHASING_ERA106_NPM_SCRIPT,
  AI_PURCHASING_ERA106_OPS_DOC,
  AI_PURCHASING_ERA106_POLICY_ID,
  AI_PURCHASING_ERA106_SUMMARY_ARTIFACT,
} from "../lib/ai/ai-purchasing-era106-policy";
import {
  auditAiPurchasingSmokeWiring,
  buildAiPurchasingSmokeEra106Summary,
  formatAiPurchasingSmokeEra106ReportLines,
} from "../lib/ai/ai-purchasing-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildAiPurchasingSmokeEra106Summary>,
): void {
  const path = join(process.cwd(), AI_PURCHASING_ERA106_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nAI Purchasing Manager smoke (${AI_PURCHASING_ERA106_POLICY_ID})\n`);
  for (const [index, step] of AI_PURCHASING_ERA106_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${AI_PURCHASING_ERA106_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 106 AI Purchasing Manager smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${AI_PURCHASING_ERA106_NPM_SCRIPT}] ${AI_PURCHASING_ERA106_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:ai-purchasing-era106:cert\n");
  const certCode = runNpmScript("test:ci:ai-purchasing-era106:cert");

  const wiring = auditAiPurchasingSmokeWiring(process.cwd());

  const summary = buildAiPurchasingSmokeEra106Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatAiPurchasingSmokeEra106ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${AI_PURCHASING_ERA106_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
