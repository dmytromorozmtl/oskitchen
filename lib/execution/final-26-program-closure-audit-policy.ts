import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditProgramClosure } from "@/lib/execution/audit-program-closure";
import {
  PROGRAM_CLOSURE_FINAL_DOC,
  PROGRAM_CLOSURE_POLICY_ID,
  PROGRAM_CLOSURE_RUNNER_SCRIPT,
  PROGRAM_CLOSURE_SUMMARY_ARTIFACT,
  PROGRAM_CLOSURE_SUMMARY_VERSION,
  PROGRAM_CLOSURE_VITEST_SPEC,
} from "@/lib/execution/program-closure-policy";
import { FINAL_EXECUTION_REPORT_ARTIFACT } from "@/lib/execution/final-execution-json-policy";

/**
 * FINAL-26 — All 220 task slots marked done (task-220 capstone).
 */

export const FINAL_26_PROGRAM_CLOSURE_POLICY_ID = PROGRAM_CLOSURE_POLICY_ID;

export type Final26ProgramClosureAuditReport = {
  policyId: typeof FINAL_26_PROGRAM_CLOSURE_POLICY_ID;
  closurePassed: boolean;
  artifactPresent: boolean;
  artifactSchemaValid: boolean;
  finalReportPresent: boolean;
  finalDocPresent: boolean;
  runnerScriptPresent: boolean;
  passed: boolean;
};

export function auditFinal26ProgramClosure(
  root = process.cwd(),
): Final26ProgramClosureAuditReport {
  const closure = auditProgramClosure(root);
  const artifactPath = join(root, PROGRAM_CLOSURE_SUMMARY_ARTIFACT);
  const artifactPresent = existsSync(artifactPath);

  let artifactSchemaValid = false;
  if (artifactPresent) {
    const summary = JSON.parse(readFileSync(artifactPath, "utf8")) as {
      version?: string;
      overall?: string;
      proofStatus?: string;
      canonicalSlotsDone?: number;
    };
    artifactSchemaValid =
      summary.version === PROGRAM_CLOSURE_SUMMARY_VERSION &&
      summary.overall === "PASS" &&
      summary.proofStatus === "proof_passed_program_closure" &&
      summary.canonicalSlotsDone === 220;
  }

  const finalReportPresent = existsSync(join(root, FINAL_EXECUTION_REPORT_ARTIFACT));
  const finalDocPresent = existsSync(join(root, PROGRAM_CLOSURE_FINAL_DOC));
  const runnerScriptPresent = existsSync(join(root, PROGRAM_CLOSURE_RUNNER_SCRIPT));

  const passed =
    closure.passed &&
    artifactPresent &&
    artifactSchemaValid &&
    finalReportPresent &&
    finalDocPresent &&
    runnerScriptPresent;

  return {
    policyId: FINAL_26_PROGRAM_CLOSURE_POLICY_ID,
    closurePassed: closure.passed,
    artifactPresent,
    artifactSchemaValid,
    finalReportPresent,
    finalDocPresent,
    runnerScriptPresent,
    passed,
  };
}

export { PROGRAM_CLOSURE_VITEST_SPEC };
