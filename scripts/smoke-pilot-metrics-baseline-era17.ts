/**
 * Era 17 pilot metrics baseline orchestrator (Cycle 19).
 *
 * Writes pilot-metrics-baseline-summary.json from env/JSON input.
 * Missing pilot data → SKIPPED WITH REASON (exit 0). Never fabricates investor metrics.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  PILOT_METRICS_BASELINE_ERA17_CYCLE_RUNBOOK_STEPS,
  PILOT_METRICS_BASELINE_ERA17_NPM_SCRIPT,
  PILOT_METRICS_BASELINE_ERA17_POLICY_ID,
  PILOT_METRICS_BASELINE_ERA17_SUMMARY_ARTIFACT,
} from "../lib/commercial/pilot-metrics-baseline-era17-policy";
import {
  buildPilotMetricsBaselineSummary,
  buildPilotMetricsSnapshotFromEnv,
  formatPilotMetricsBaselineReportLines,
  parsePilotMetricsSnapshotJson,
} from "../lib/commercial/pilot-metrics-baseline-summary";

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function parsePilotWeek(): number | null {
  const raw = process.env.PILOT_METRICS_PILOT_WEEK?.trim();
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function printRunbook(): void {
  console.log(`\nPilot metrics baseline (${PILOT_METRICS_BASELINE_ERA17_POLICY_ID})\n`);
  for (const [index, step] of PILOT_METRICS_BASELINE_ERA17_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log("\nSee docs/pilot-metrics-baseline-era17.md\n");
}

function main() {
  if (hasFlag("--help") || hasFlag("-h")) {
    console.log(`
Era 17 pilot metrics baseline

  (default)         Capture metrics from env/JSON; write summary artifact
  --checklist-only  Print runbook steps
  --template-only   Write empty baseline template (all metrics missing)

Env:
  PILOT_METRICS_SNAPSHOT_JSON
  PILOT_METRICS_PILOT_WEEK
  PILOT_METRICS_CUSTOMER_REF
  PILOT_METRICS_CAPTURED_AT
  PILOT_METRICS_ORDERS_PER_DAY
  PILOT_METRICS_STOREFRONT_CHECKOUT_SUCCESS_RATE
  PILOT_METRICS_POS_CHECKOUT_STATUS
  PILOT_METRICS_KDS_BUMP_RATE
  PILOT_METRICS_SUPPORT_TICKETS_PER_WEEK
  PILOT_METRICS_OPERATOR_FEEDBACK_SCORE
`);
    process.exit(0);
  }

  if (hasFlag("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(
    `\n[${PILOT_METRICS_BASELINE_ERA17_NPM_SCRIPT}] ${PILOT_METRICS_BASELINE_ERA17_POLICY_ID}\n`,
  );

  const jsonInput = hasFlag("--template-only")
    ? {}
    : parsePilotMetricsSnapshotJson(process.env.PILOT_METRICS_SNAPSHOT_JSON);
  const snapshot = hasFlag("--template-only")
    ? {}
    : buildPilotMetricsSnapshotFromEnv(jsonInput);

  const summary = buildPilotMetricsBaselineSummary(snapshot, {
    pilotWeek: parsePilotWeek(),
    customerRef: process.env.PILOT_METRICS_CUSTOMER_REF ?? null,
    capturedAt: process.env.PILOT_METRICS_CAPTURED_AT ?? null,
  });

  const artifactPath = join(process.cwd(), PILOT_METRICS_BASELINE_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  for (const line of formatPilotMetricsBaselineReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${PILOT_METRICS_BASELINE_ERA17_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.baselineProofStatus === "proof_skipped_missing_pilot_data") {
    console.log(
      "SKIPPED WITH REASON — no pilot metrics captured; template written for week-2 baseline ops.\n",
    );
  }
}

main();
