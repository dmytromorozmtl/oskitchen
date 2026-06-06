/**
 * Era 120 Marketplace Quality Scoring orchestrator — supplier ratings wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  QUALITY_SCORING_ERA120_CYCLE_RUNBOOK_STEPS,
  QUALITY_SCORING_ERA120_NPM_SCRIPT,
  QUALITY_SCORING_ERA120_OPS_DOC,
  QUALITY_SCORING_ERA120_POLICY_ID,
  QUALITY_SCORING_ERA120_SUMMARY_ARTIFACT,
} from "../lib/marketplace/marketplace-quality-scoring-era120-policy";
import {
  auditQualityScoringSmokeWiring,
  buildQualityScoringSmokeEra120Summary,
  formatQualityScoringSmokeEra120ReportLines,
} from "../lib/marketplace/marketplace-quality-scoring-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildQualityScoringSmokeEra120Summary>,
): void {
  const path = join(process.cwd(), QUALITY_SCORING_ERA120_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nMarketplace Quality Scoring smoke (${QUALITY_SCORING_ERA120_POLICY_ID})\n`);
  for (const [index, step] of QUALITY_SCORING_ERA120_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${QUALITY_SCORING_ERA120_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 120 Marketplace Quality Scoring smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${QUALITY_SCORING_ERA120_NPM_SCRIPT}] ${QUALITY_SCORING_ERA120_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:marketplace-quality-scoring-era120:cert\n");
  const certCode = runNpmScript("test:ci:marketplace-quality-scoring-era120:cert");

  const wiring = auditQualityScoringSmokeWiring(process.cwd());

  const summary = buildQualityScoringSmokeEra120Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatQualityScoringSmokeEra120ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${QUALITY_SCORING_ERA120_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
