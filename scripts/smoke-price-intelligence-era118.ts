/**
 * Era 118 Price Intelligence orchestrator — cheapest supplier + auto-switch wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  PRICE_INTELLIGENCE_ERA118_CYCLE_RUNBOOK_STEPS,
  PRICE_INTELLIGENCE_ERA118_NPM_SCRIPT,
  PRICE_INTELLIGENCE_ERA118_OPS_DOC,
  PRICE_INTELLIGENCE_ERA118_POLICY_ID,
  PRICE_INTELLIGENCE_ERA118_SUMMARY_ARTIFACT,
} from "../lib/marketplace/price-intelligence-era118-policy";
import {
  auditPriceIntelligenceSmokeWiring,
  buildPriceIntelligenceSmokeEra118Summary,
  formatPriceIntelligenceSmokeEra118ReportLines,
} from "../lib/marketplace/price-intelligence-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildPriceIntelligenceSmokeEra118Summary>,
): void {
  const path = join(process.cwd(), PRICE_INTELLIGENCE_ERA118_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nPrice Intelligence smoke (${PRICE_INTELLIGENCE_ERA118_POLICY_ID})\n`);
  for (const [index, step] of PRICE_INTELLIGENCE_ERA118_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${PRICE_INTELLIGENCE_ERA118_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 118 Price Intelligence smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${PRICE_INTELLIGENCE_ERA118_NPM_SCRIPT}] ${PRICE_INTELLIGENCE_ERA118_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:price-intelligence-era118:cert\n");
  const certCode = runNpmScript("test:ci:price-intelligence-era118:cert");

  const wiring = auditPriceIntelligenceSmokeWiring(process.cwd());

  const summary = buildPriceIntelligenceSmokeEra118Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatPriceIntelligenceSmokeEra118ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${PRICE_INTELLIGENCE_ERA118_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
