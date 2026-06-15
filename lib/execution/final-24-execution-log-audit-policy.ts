import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditExecutionLogContinuity } from "@/lib/execution/audit-execution-log-continuity";
import {
  EXECUTION_LOG_ARTIFACT,
  EXECUTION_LOG_CONTINUITY_SUMMARY_ARTIFACT,
  EXECUTION_LOG_CONTINUITY_SUMMARY_VERSION,
  EXECUTION_LOG_HEADER_MARKER,
  EXECUTION_LOG_POLICY_ID,
  EXECUTION_LOG_RUNNER_SCRIPT,
  EXECUTION_LOG_VITEST_SPEC,
} from "@/lib/execution/execution-log-policy";
import {
  FINAL_EXECUTION_DOC_SYNC_SUMMARY_ARTIFACT,
  FINAL_EXECUTION_DOC_SYNC_SUMMARY_VERSION,
} from "@/lib/execution/final-execution-doc-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";

/**
 * FINAL-24 — Execution log cycle continuity gate (task-218).
 */

export const FINAL_24_EXECUTION_LOG_POLICY_ID = EXECUTION_LOG_POLICY_ID;

export type Final24ExecutionLogAuditReport = {
  policyId: typeof FINAL_24_EXECUTION_LOG_POLICY_ID;
  phaseId: "FINAL-24";
  taskSlot: number;
  logPresent: boolean;
  logRegistryHonest: boolean;
  artifactPresent: boolean;
  artifactSchemaValid: boolean;
  continuityHonest: boolean;
  vitestSpecPresent: boolean;
  runnerScriptPresent: boolean;
  final23Passed: boolean;
  passed: boolean;
};

function readFinal23ArtifactPassed(root: string): boolean {
  const path = join(root, FINAL_EXECUTION_DOC_SYNC_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return false;
  const summary = JSON.parse(readFileSync(path, "utf8")) as {
    version?: string;
    overall?: string;
    proofStatus?: string;
    vitestPassed?: boolean;
  };
  return (
    summary.version === FINAL_EXECUTION_DOC_SYNC_SUMMARY_VERSION &&
    summary.overall === "PASS" &&
    summary.proofStatus === "proof_synced_final_execution_doc" &&
    summary.vitestPassed === true
  );
}

export function auditExecutionLogRegistry(root = process.cwd()): boolean {
  const audit = auditExecutionLogContinuity(root);
  if (!audit.logPresent) return false;
  const content = readFileSync(join(root, EXECUTION_LOG_ARTIFACT), "utf8");
  return audit.continuityHonest && content.includes(EXECUTION_LOG_HEADER_MARKER);
}

export function auditFinal24ExecutionLog(root = process.cwd()): Final24ExecutionLogAuditReport {
  const phase = FINAL_ORCHESTRATOR_PHASES[23]!;
  const logPresent = existsSync(join(root, EXECUTION_LOG_ARTIFACT));
  const logRegistryHonest = auditExecutionLogRegistry(root);
  const vitestSpecPresent = existsSync(join(root, EXECUTION_LOG_VITEST_SPEC));

  const artifactPath = join(root, EXECUTION_LOG_CONTINUITY_SUMMARY_ARTIFACT);
  const artifactPresent = existsSync(artifactPath);

  let artifactSchemaValid = false;
  let continuityHonest = false;

  if (artifactPresent) {
    const summary = JSON.parse(readFileSync(artifactPath, "utf8")) as {
      version?: string;
      overall?: string;
      proofStatus?: string;
      lastCycle?: number;
      hasCycle213?: boolean;
      headerMarkerPresent?: boolean;
      vitestPassed?: boolean;
      runner?: string;
      honestyNote?: string;
    };

    artifactSchemaValid =
      summary.version === EXECUTION_LOG_CONTINUITY_SUMMARY_VERSION &&
      summary.runner === EXECUTION_LOG_RUNNER_SCRIPT &&
      summary.headerMarkerPresent === true &&
      summary.hasCycle213 === true &&
      (summary.lastCycle ?? 0) >= 213 &&
      summary.vitestPassed === true &&
      typeof summary.honestyNote === "string";

    continuityHonest =
      summary.overall === "PASS" && summary.proofStatus === "proof_passed_execution_log_continuity";
  }

  const runnerScriptPresent = existsSync(join(root, EXECUTION_LOG_RUNNER_SCRIPT));
  const final23Passed = readFinal23ArtifactPassed(root);

  const passed =
    logPresent &&
    logRegistryHonest &&
    artifactPresent &&
    artifactSchemaValid &&
    continuityHonest &&
    vitestSpecPresent &&
    runnerScriptPresent &&
    final23Passed;

  return {
    policyId: FINAL_24_EXECUTION_LOG_POLICY_ID,
    phaseId: "FINAL-24",
    taskSlot: phase.taskSlot,
    logPresent,
    logRegistryHonest,
    artifactPresent,
    artifactSchemaValid,
    continuityHonest,
    vitestSpecPresent,
    runnerScriptPresent,
    final23Passed,
    passed,
  };
}
