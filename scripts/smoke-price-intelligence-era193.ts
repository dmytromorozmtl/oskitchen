/**
 * Era 193 Price Intelligence orchestrator — Round 2 wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  PRICE_INTELLIGENCE_ERA193_CYCLE_RUNBOOK_STEPS,
  PRICE_INTELLIGENCE_ERA193_NPM_SCRIPT,
  PRICE_INTELLIGENCE_ERA193_OPS_DOC,
  PRICE_INTELLIGENCE_ERA193_POLICY_ID,
  PRICE_INTELLIGENCE_ERA193_SUMMARY_ARTIFACT,
} from "../lib/marketplace/price-intelligence-era193-policy";
import {
  auditPriceIntelligenceSmokeEra193Wiring,
  buildPriceIntelligenceSmokeEra193Summary,
  formatPriceIntelligenceSmokeEra193ReportLines,
} from "../lib/marketplace/price-intelligence-era193-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildPriceIntelligenceSmokeEra193Summary>,
): void {
  const path = join(process.cwd(), PRICE_INTELLIGENCE_ERA193_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nPrice Intelligence (${PRICE_INTELLIGENCE_ERA193_POLICY_ID})\n`);
  for (const [index, step] of PRICE_INTELLIGENCE_ERA193_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${PRICE_INTELLIGENCE_ERA193_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 193 Price Intelligence smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${PRICE_INTELLIGENCE_ERA193_NPM_SCRIPT}] ${PRICE_INTELLIGENCE_ERA193_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:price-intelligence-era193:cert\n");
  const certCode = runNpmScript("test:ci:price-intelligence-era193:cert");

  const wiring = auditPriceIntelligenceSmokeEra193Wiring(process.cwd());

  const summary = buildPriceIntelligenceSmokeEra193Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatPriceIntelligenceSmokeEra193ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${PRICE_INTELLIGENCE_ERA193_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
