import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  COMMERCIAL_PILOT_RUNBOOK_FINAL_SUMMARY_ARTIFACT,
  COMMERCIAL_PILOT_RUNBOOK_FINAL_SUMMARY_VERSION,
} from "@/lib/execution/commercial-pilot-runbook-final-policy";
import {
  FINAL_EXECUTION_JSON_POLICY_ID,
  FINAL_EXECUTION_JSON_RUNNER_SCRIPT,
  FINAL_EXECUTION_JSON_SYNC_SUMMARY_ARTIFACT,
  FINAL_EXECUTION_JSON_SYNC_SUMMARY_VERSION,
  FINAL_EXECUTION_JSON_VITEST_SPEC,
  FINAL_EXECUTION_REPORT_ARTIFACT,
  FINAL_EXECUTION_REPORT_REQUIRED_KEYS,
} from "@/lib/execution/final-execution-json-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";
import {
  auditFinalExecutionReportSchema,
  buildFinalExecutionReport,
} from "@/lib/execution/sync-final-execution-report";

/**
 * FINAL-22 — Final execution JSON artifact sync gate (task-216).
 */

export const FINAL_22_FINAL_EXECUTION_JSON_POLICY_ID = FINAL_EXECUTION_JSON_POLICY_ID;

export type Final22FinalExecutionJsonAuditReport = {
  policyId: typeof FINAL_22_FINAL_EXECUTION_JSON_POLICY_ID;
  phaseId: "FINAL-22";
  taskSlot: number;
  reportPresent: boolean;
  reportSchemaValid: boolean;
  syncSummaryPresent: boolean;
  syncHonest: boolean;
  vitestSpecPresent: boolean;
  runnerScriptPresent: boolean;
  final21Passed: boolean;
  passed: boolean;
};

function readFinal21ArtifactPassed(root: string): boolean {
  const path = join(root, COMMERCIAL_PILOT_RUNBOOK_FINAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return false;
  const summary = JSON.parse(readFileSync(path, "utf8")) as {
    version?: string;
    overall?: string;
    proofStatus?: string;
    runbookVitestPassed?: boolean;
  };
  return (
    summary.version === COMMERCIAL_PILOT_RUNBOOK_FINAL_SUMMARY_VERSION &&
    summary.overall === "PASS" &&
    summary.proofStatus === "proof_passed_commercial_pilot_runbook" &&
    summary.runbookVitestPassed === true
  );
}

export function auditFinal22FinalExecutionJson(
  root = process.cwd(),
): Final22FinalExecutionJsonAuditReport {
  const phase = FINAL_ORCHESTRATOR_PHASES[21]!;
  const reportPresent = existsSync(join(root, FINAL_EXECUTION_REPORT_ARTIFACT));
  const syncSummaryPresent = existsSync(join(root, FINAL_EXECUTION_JSON_SYNC_SUMMARY_ARTIFACT));

  let reportSchemaValid = false;
  let syncHonest = false;

  if (reportPresent) {
    const report = JSON.parse(
      readFileSync(join(root, FINAL_EXECUTION_REPORT_ARTIFACT), "utf8"),
    ) as ReturnType<typeof buildFinalExecutionReport>;
    reportSchemaValid =
      auditFinalExecutionReportSchema(report) &&
      FINAL_EXECUTION_REPORT_REQUIRED_KEYS.every((key) => key in report);
  }

  if (syncSummaryPresent) {
    const summary = JSON.parse(
      readFileSync(join(root, FINAL_EXECUTION_JSON_SYNC_SUMMARY_ARTIFACT), "utf8"),
    ) as {
      version?: string;
      overall?: string;
      proofStatus?: string;
      schemaValid?: boolean;
      vitestPassed?: boolean;
      runner?: string;
      honestyNote?: string;
    };

    syncHonest =
      summary.version === FINAL_EXECUTION_JSON_SYNC_SUMMARY_VERSION &&
      summary.overall === "PASS" &&
      summary.proofStatus === "proof_synced_final_execution_json" &&
      summary.runner === FINAL_EXECUTION_JSON_RUNNER_SCRIPT &&
      summary.schemaValid === true &&
      summary.vitestPassed === true &&
      typeof summary.honestyNote === "string";
  }

  const vitestSpecPresent = existsSync(join(root, FINAL_EXECUTION_JSON_VITEST_SPEC));
  const runnerScriptPresent = existsSync(join(root, FINAL_EXECUTION_JSON_RUNNER_SCRIPT));
  const final21Passed = readFinal21ArtifactPassed(root);

  const passed =
    reportPresent &&
    reportSchemaValid &&
    syncSummaryPresent &&
    syncHonest &&
    vitestSpecPresent &&
    runnerScriptPresent &&
    final21Passed;

  return {
    policyId: FINAL_22_FINAL_EXECUTION_JSON_POLICY_ID,
    phaseId: "FINAL-22",
    taskSlot: phase.taskSlot,
    reportPresent,
    reportSchemaValid,
    syncSummaryPresent,
    syncHonest,
    vitestSpecPresent,
    runnerScriptPresent,
    final21Passed,
    passed,
  };
}
