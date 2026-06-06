/**
 * Era 194 Marketplace Financing orchestrator — Round 2 wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  MARKETPLACE_FINANCING_ERA194_CYCLE_RUNBOOK_STEPS,
  MARKETPLACE_FINANCING_ERA194_NPM_SCRIPT,
  MARKETPLACE_FINANCING_ERA194_OPS_DOC,
  MARKETPLACE_FINANCING_ERA194_POLICY_ID,
  MARKETPLACE_FINANCING_ERA194_SUMMARY_ARTIFACT,
} from "../lib/marketplace/marketplace-financing-era194-policy";
import {
  auditMarketplaceFinancingSmokeEra194Wiring,
  buildMarketplaceFinancingSmokeEra194Summary,
  formatMarketplaceFinancingSmokeEra194ReportLines,
} from "../lib/marketplace/marketplace-financing-era194-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildMarketplaceFinancingSmokeEra194Summary>,
): void {
  const path = join(process.cwd(), MARKETPLACE_FINANCING_ERA194_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nMarketplace Financing (${MARKETPLACE_FINANCING_ERA194_POLICY_ID})\n`);
  for (const [index, step] of MARKETPLACE_FINANCING_ERA194_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${MARKETPLACE_FINANCING_ERA194_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 194 Marketplace Financing smoke

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
    `\n[${MARKETPLACE_FINANCING_ERA194_NPM_SCRIPT}] ${MARKETPLACE_FINANCING_ERA194_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:marketplace-financing-era194:cert\n");
  const certCode = runNpmScript("test:ci:marketplace-financing-era194:cert");

  const wiring = auditMarketplaceFinancingSmokeEra194Wiring(process.cwd());

  const summary = buildMarketplaceFinancingSmokeEra194Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatMarketplaceFinancingSmokeEra194ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${MARKETPLACE_FINANCING_ERA194_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
