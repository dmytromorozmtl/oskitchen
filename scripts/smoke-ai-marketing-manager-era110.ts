/**
 * Era 110 AI Marketing Manager orchestrator — auto campaigns + weather promos wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  AI_MARKETING_MANAGER_ERA110_CYCLE_RUNBOOK_STEPS,
  AI_MARKETING_MANAGER_ERA110_NPM_SCRIPT,
  AI_MARKETING_MANAGER_ERA110_OPS_DOC,
  AI_MARKETING_MANAGER_ERA110_POLICY_ID,
  AI_MARKETING_MANAGER_ERA110_SUMMARY_ARTIFACT,
} from "../lib/ai/marketing-manager-era110-policy";
import {
  auditAiMarketingManagerSmokeWiring,
  buildAiMarketingManagerSmokeEra110Summary,
  formatAiMarketingManagerSmokeEra110ReportLines,
} from "../lib/ai/marketing-manager-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildAiMarketingManagerSmokeEra110Summary>,
): void {
  const path = join(process.cwd(), AI_MARKETING_MANAGER_ERA110_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nAI Marketing Manager smoke (${AI_MARKETING_MANAGER_ERA110_POLICY_ID})\n`);
  for (const [index, step] of AI_MARKETING_MANAGER_ERA110_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${AI_MARKETING_MANAGER_ERA110_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 110 AI Marketing Manager smoke

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
    `\n[${AI_MARKETING_MANAGER_ERA110_NPM_SCRIPT}] ${AI_MARKETING_MANAGER_ERA110_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:ai-marketing-manager-era110:cert\n");
  const certCode = runNpmScript("test:ci:ai-marketing-manager-era110:cert");

  const wiring = auditAiMarketingManagerSmokeWiring(process.cwd());

  const summary = buildAiMarketingManagerSmokeEra110Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatAiMarketingManagerSmokeEra110ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${AI_MARKETING_MANAGER_ERA110_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
