/**
 * Era 17 pilot rollback drill orchestrator (Cycle 20).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  PILOT_ROLLBACK_DRILL_ERA17_CYCLE_RUNBOOK_STEPS,
  PILOT_ROLLBACK_DRILL_ERA17_NPM_SCRIPT,
  PILOT_ROLLBACK_DRILL_ERA17_POLICY_ID,
  PILOT_ROLLBACK_DRILL_ERA17_SUMMARY_ARTIFACT,
} from "../lib/commercial/pilot-rollback-drill-era17-policy";
import {
  buildPilotRollbackDrillInputFromEnv,
  buildPilotRollbackDrillSummary,
  formatPilotRollbackDrillReportLines,
} from "../lib/commercial/pilot-rollback-drill-summary";

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function readCommitSha(): string | null {
  const fromEnv = process.env.PILOT_ROLLBACK_DRILL_COMMIT_SHA?.trim();
  if (fromEnv) return fromEnv;
  const result = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" });
  if (result.status !== 0) return null;
  return result.stdout.trim() || null;
}

function printRunbook(): void {
  console.log(`\nPilot rollback drill (${PILOT_ROLLBACK_DRILL_ERA17_POLICY_ID})\n`);
  for (const [index, step] of PILOT_ROLLBACK_DRILL_ERA17_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log("\nSee docs/pilot-rollback-drill-era17.md\n");
}

function main() {
  if (hasFlag("--help") || hasFlag("-h")) {
    console.log(`
Era 17 pilot rollback drill + retrospective

  (default)         Record drill from env; write summary artifact
  --checklist-only  Print runbook steps
  --template-only   Write template with all steps SKIPPED

Env:
  PILOT_ROLLBACK_DRILL_MODE=tabletop|staging
  PILOT_ROLLBACK_DRILL_OPERATOR_EMAIL
  PILOT_ROLLBACK_DRILL_STAGING_URL
  PILOT_ROLLBACK_DRILL_REASON
  PILOT_ROLLBACK_STEP_<1-6>_STATUS=PASSED|FAILED
  PILOT_RETROSPECTIVE_OUTCOME
  PILOT_RETROSPECTIVE_LESSONS
`);
    process.exit(0);
  }

  if (hasFlag("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(
    `\n[${PILOT_ROLLBACK_DRILL_ERA17_NPM_SCRIPT}] ${PILOT_ROLLBACK_DRILL_ERA17_POLICY_ID}\n`,
  );

  const input = hasFlag("--template-only")
    ? { drillMode: "unset" as const }
    : (() => {
        const fromEnv = buildPilotRollbackDrillInputFromEnv();
        return {
          ...fromEnv,
          commitSha: fromEnv.commitSha ?? readCommitSha(),
        };
      })();

  const summary = buildPilotRollbackDrillSummary(input);
  const artifactPath = join(process.cwd(), PILOT_ROLLBACK_DRILL_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  for (const line of formatPilotRollbackDrillReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${PILOT_ROLLBACK_DRILL_ERA17_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.rollbackProofStatus === "proof_failed") {
    process.exit(1);
  }
  if (summary.rollbackProofStatus === "proof_skipped_missing_prerequisites") {
    console.log(
      "SKIPPED WITH REASON — rollback drill not executed; template written for ops tabletop.\n",
    );
  }
}

main();
