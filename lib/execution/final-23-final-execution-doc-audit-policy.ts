import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  FINAL_EXECUTION_DOC_MARKERS,
  FINAL_EXECUTION_DOC_PATH,
  FINAL_EXECUTION_DOC_POLICY_ID,
  FINAL_EXECUTION_DOC_RUNNER_SCRIPT,
  FINAL_EXECUTION_DOC_SYNC_SUMMARY_ARTIFACT,
  FINAL_EXECUTION_DOC_SYNC_SUMMARY_VERSION,
  FINAL_EXECUTION_DOC_VITEST_SPEC,
} from "@/lib/execution/final-execution-doc-policy";
import {
  auditFinalExecutionDocContent,
  loadFinalExecutionReport,
} from "@/lib/execution/sync-final-execution-doc";
import {
  FINAL_EXECUTION_JSON_SYNC_SUMMARY_ARTIFACT,
  FINAL_EXECUTION_JSON_SYNC_SUMMARY_VERSION,
  FINAL_EXECUTION_REPORT_ARTIFACT,
} from "@/lib/execution/final-execution-json-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";

/**
 * FINAL-23 — Final execution markdown report sync gate (task-217).
 */

export const FINAL_23_FINAL_EXECUTION_DOC_POLICY_ID = FINAL_EXECUTION_DOC_POLICY_ID;

export type Final23FinalExecutionDocAuditReport = {
  policyId: typeof FINAL_23_FINAL_EXECUTION_DOC_POLICY_ID;
  phaseId: "FINAL-23";
  taskSlot: number;
  docPresent: boolean;
  jsonReportPresent: boolean;
  docRegistryHonest: boolean;
  artifactPresent: boolean;
  artifactSchemaValid: boolean;
  docHonest: boolean;
  runnerScriptPresent: boolean;
  final22Passed: boolean;
  passed: boolean;
};

function readFinal22ArtifactPassed(root: string): boolean {
  const path = join(root, FINAL_EXECUTION_JSON_SYNC_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return false;
  const summary = JSON.parse(readFileSync(path, "utf8")) as {
    version?: string;
    overall?: string;
    proofStatus?: string;
    schemaValid?: boolean;
    vitestPassed?: boolean;
  };
  return (
    summary.version === FINAL_EXECUTION_JSON_SYNC_SUMMARY_VERSION &&
    summary.overall === "PASS" &&
    summary.proofStatus === "proof_synced_final_execution_json" &&
    summary.schemaValid === true &&
    summary.vitestPassed === true
  );
}

export function auditFinalExecutionDocRegistry(root = process.cwd()): boolean {
  const docPath = join(root, FINAL_EXECUTION_DOC_PATH);
  if (!existsSync(docPath)) return false;
  const markdown = readFileSync(docPath, "utf8");
  const report = loadFinalExecutionReport(root);
  return (
    FINAL_EXECUTION_DOC_MARKERS.every((m) => markdown.includes(m)) &&
    auditFinalExecutionDocContent(markdown, report)
  );
}

export function auditFinal23FinalExecutionDoc(
  root = process.cwd(),
): Final23FinalExecutionDocAuditReport {
  const phase = FINAL_ORCHESTRATOR_PHASES[22]!;
  const docPresent = existsSync(join(root, FINAL_EXECUTION_DOC_PATH));
  const jsonReportPresent = existsSync(join(root, FINAL_EXECUTION_REPORT_ARTIFACT));
  const docRegistryHonest = auditFinalExecutionDocRegistry(root);

  const artifactPath = join(root, FINAL_EXECUTION_DOC_SYNC_SUMMARY_ARTIFACT);
  const artifactPresent = existsSync(artifactPath);

  let artifactSchemaValid = false;
  let docHonest = false;

  if (artifactPresent) {
    const summary = JSON.parse(readFileSync(artifactPath, "utf8")) as {
      version?: string;
      overall?: string;
      proofStatus?: string;
      docContentValid?: boolean;
      vitestPassed?: boolean;
      runner?: string;
      honestyNote?: string;
    };

    artifactSchemaValid =
      summary.version === FINAL_EXECUTION_DOC_SYNC_SUMMARY_VERSION &&
      summary.runner === FINAL_EXECUTION_DOC_RUNNER_SCRIPT &&
      summary.docContentValid === true &&
      summary.vitestPassed === true &&
      typeof summary.honestyNote === "string";

    docHonest =
      summary.overall === "PASS" && summary.proofStatus === "proof_synced_final_execution_doc";
  }

  const runnerScriptPresent = existsSync(join(root, FINAL_EXECUTION_DOC_RUNNER_SCRIPT));
  const final22Passed = readFinal22ArtifactPassed(root);

  const passed =
    docPresent &&
    jsonReportPresent &&
    docRegistryHonest &&
    artifactPresent &&
    artifactSchemaValid &&
    docHonest &&
    runnerScriptPresent &&
    final22Passed;

  return {
    policyId: FINAL_23_FINAL_EXECUTION_DOC_POLICY_ID,
    phaseId: "FINAL-23",
    taskSlot: phase.taskSlot,
    docPresent,
    jsonReportPresent,
    docRegistryHonest,
    artifactPresent,
    artifactSchemaValid,
    docHonest,
    runnerScriptPresent,
    final22Passed,
    passed,
  };
}
