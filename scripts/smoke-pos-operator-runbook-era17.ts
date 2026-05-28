/**
 * Era 17 POS operator runbook smoke — cert chain + golden-path summary artifact.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  POS_OPERATOR_RUNBOOK_ERA17_GOLDEN_PATH_STEPS,
  POS_OPERATOR_RUNBOOK_ERA17_POLICY_ID,
  POS_OPERATOR_RUNBOOK_ERA17_SUMMARY_ARTIFACT,
} from "../lib/pos/pos-operator-runbook-era17-policy";
import {
  buildPosOperatorRunbookSummary,
  formatPosOperatorRunbookStepLine,
  parsePosOperatorRunbookEnv,
} from "../lib/pos/pos-operator-runbook-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function main() {
  const templateOnly = process.argv.includes("--template-only");
  const skipCert = templateOnly;

  console.log(`\n[smoke:pos-operator-runbook] ${POS_OPERATOR_RUNBOOK_ERA17_POLICY_ID}\n`);

  let certExitCode = 0;
  if (!skipCert) {
    certExitCode = runNpmScript("test:ci:pos-operator-runbook-era17:cert");
  }

  const envInput = parsePosOperatorRunbookEnv();
  const summary = buildPosOperatorRunbookSummary({
    ...envInput,
    certPassed: certExitCode === 0,
  });

  const artifactPath = join(process.cwd(), POS_OPERATOR_RUNBOOK_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(`\nPOS operator runbook (${POS_OPERATOR_RUNBOOK_ERA17_POLICY_ID}) — proof: ${summary.posOperatorProofStatus}`);
  console.log(`Run at: ${summary.runAt}`);
  console.log(`Operator: ${summary.operatorEmail ?? "not recorded"}`);
  console.log(`Steps passed: ${summary.passedStepCount}/${summary.totalSteps}\n`);

  for (const step of summary.steps) {
    console.log(formatPosOperatorRunbookStepLine(step));
  }

  console.log(`\nSummary artifact: ${POS_OPERATOR_RUNBOOK_ERA17_SUMMARY_ARTIFACT}\n`);
  console.log("Golden path steps:");
  POS_OPERATOR_RUNBOOK_ERA17_GOLDEN_PATH_STEPS.forEach((step, i) => {
    console.log(`${i + 1}. ${step}`);
  });
  console.log(`\nSee docs/pos-software-only-operator-runbook-era17.md\n`);

  if (certExitCode !== 0) {
    console.error("FAILED — operator runbook cert chain did not pass.");
    process.exit(certExitCode);
  }

  if (summary.posOperatorProofStatus === "awaiting_operator_golden_path_execution") {
    console.log("SKIPPED WITH REASON — golden path not executed; template written for ops.");
    process.exit(0);
  }

  if (summary.posOperatorProofStatus === "proof_failed") {
    process.exit(1);
  }

  process.exit(0);
}

main();
