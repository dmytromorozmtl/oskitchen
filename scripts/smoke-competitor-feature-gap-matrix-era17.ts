/**
 * Era 17 competitor feature gap matrix smoke — cert chain + alignment artifact.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  COMPETITOR_FEATURE_GAP_MATRIX_ERA17_CYCLE_RUNBOOK_STEPS,
  COMPETITOR_FEATURE_GAP_MATRIX_ERA17_NPM_SCRIPT,
  COMPETITOR_FEATURE_GAP_MATRIX_ERA17_POLICY_ID,
  COMPETITOR_FEATURE_GAP_MATRIX_ERA17_REQUIRED_COMPETITORS,
  COMPETITOR_FEATURE_GAP_MATRIX_ERA17_SUMMARY_ARTIFACT,
} from "../lib/commercial/competitor-feature-gap-matrix-era17-policy";
import {
  buildCompetitorFeatureGapMatrixSummary,
  formatCompetitorFeatureGapMatrixReportLines,
} from "../lib/commercial/competitor-feature-gap-matrix-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(summary: ReturnType<typeof buildCompetitorFeatureGapMatrixSummary>): void {
  const path = join(process.cwd(), COMPETITOR_FEATURE_GAP_MATRIX_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nCompetitor feature gap matrix (${COMPETITOR_FEATURE_GAP_MATRIX_ERA17_POLICY_ID})\n`);
  for (const [index, step] of COMPETITOR_FEATURE_GAP_MATRIX_ERA17_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log("\nSee docs/competitor-feature-gap-matrix.md\n");
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 17 competitor feature gap matrix smoke

  (default)         Cert chain + alignment artifact
  --checklist-only  Print runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(
    `\n[${COMPETITOR_FEATURE_GAP_MATRIX_ERA17_NPM_SCRIPT}] ${COMPETITOR_FEATURE_GAP_MATRIX_ERA17_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:competitor-feature-gap-matrix-era17:cert\n");
  const certCode = runNpmScript("test:ci:competitor-feature-gap-matrix-era17:cert");
  const summary = buildCompetitorFeatureGapMatrixSummary({
    certPassed: certCode === 0,
    requiredCompetitorCount: COMPETITOR_FEATURE_GAP_MATRIX_ERA17_REQUIRED_COMPETITORS.length,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatCompetitorFeatureGapMatrixReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${COMPETITOR_FEATURE_GAP_MATRIX_ERA17_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
