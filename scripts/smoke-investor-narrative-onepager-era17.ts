/**
 * Era 17 investor narrative one-pager smoke — cert chain + pilot metrics gate.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  INVESTOR_NARRATIVE_ONEPAGER_ERA17_CYCLE_RUNBOOK_STEPS,
  INVESTOR_NARRATIVE_ONEPAGER_ERA17_NPM_SCRIPT,
  INVESTOR_NARRATIVE_ONEPAGER_ERA17_PILOT_METRICS_ARTIFACT,
  INVESTOR_NARRATIVE_ONEPAGER_ERA17_POLICY_ID,
  INVESTOR_NARRATIVE_ONEPAGER_ERA17_SUMMARY_ARTIFACT,
} from "../lib/commercial/investor-narrative-onepager-era17-policy";
import {
  buildInvestorNarrativeOnepagerSummary,
  formatInvestorNarrativeOnepagerReportLines,
  type PilotMetricsBaselineArtifactRef,
} from "../lib/commercial/investor-narrative-onepager-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function loadPilotMetricsArtifact(): PilotMetricsBaselineArtifactRef | null {
  const path = join(process.cwd(), INVESTOR_NARRATIVE_ONEPAGER_ERA17_PILOT_METRICS_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as PilotMetricsBaselineArtifactRef;
  } catch {
    return null;
  }
}

function writeSummary(summary: ReturnType<typeof buildInvestorNarrativeOnepagerSummary>): void {
  const path = join(process.cwd(), INVESTOR_NARRATIVE_ONEPAGER_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nInvestor narrative one-pager (${INVESTOR_NARRATIVE_ONEPAGER_ERA17_POLICY_ID})\n`);
  for (const [index, step] of INVESTOR_NARRATIVE_ONEPAGER_ERA17_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log("\nSee docs/investor-narrative-onepager-era17.md\n");
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 17 investor narrative one-pager smoke

  (default)         Cert chain + pilot metrics gate artifact
  --checklist-only  Print runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${INVESTOR_NARRATIVE_ONEPAGER_ERA17_NPM_SCRIPT}] ${INVESTOR_NARRATIVE_ONEPAGER_ERA17_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:investor-narrative-onepager-era17:cert\n");
  const certCode = runNpmScript("test:ci:investor-narrative-onepager-era17:cert");
  const pilotMetrics = loadPilotMetricsArtifact();
  const summary = buildInvestorNarrativeOnepagerSummary({
    pilotMetrics,
    certPassed: certCode === 0,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatInvestorNarrativeOnepagerReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${INVESTOR_NARRATIVE_ONEPAGER_ERA17_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }

  if (summary.narrativeProofStatus === "proof_skipped_missing_pilot_metrics") {
    console.log(
      "SKIPPED WITH REASON — template only; pilot metrics baseline overall PASSED required for live KPI narrative.\n",
    );
  }
}

main();
