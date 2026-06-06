import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  CROSS_TENANT_ISOLATION_SUMMARY_ARTIFACT,
  CROSS_TENANT_ISOLATION_SUMMARY_VERSION,
} from "@/lib/execution/cross-tenant-isolation-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";
import {
  WEBHOOK_SIGNATURE_MATRIX_CONTRACT_MARKERS,
  WEBHOOK_SIGNATURE_MATRIX_POLICY_ID,
  WEBHOOK_SIGNATURE_MATRIX_RUNNER_SCRIPT,
  WEBHOOK_SIGNATURE_MATRIX_SUMMARY_ARTIFACT,
  WEBHOOK_SIGNATURE_MATRIX_SUMMARY_VERSION,
  WEBHOOK_SIGNATURE_MATRIX_VITEST_SPEC,
  WEBHOOK_SIGNATURE_STATIC_AUDIT_ARTIFACT,
} from "@/lib/execution/webhook-signature-matrix-policy";

/**
 * FINAL-17 — Webhook signature matrix gate (task-211).
 */

export const FINAL_17_WEBHOOK_SIGNATURE_POLICY_ID = WEBHOOK_SIGNATURE_MATRIX_POLICY_ID;

export type Final17WebhookSignatureAuditReport = {
  policyId: typeof FINAL_17_WEBHOOK_SIGNATURE_POLICY_ID;
  phaseId: "FINAL-17";
  taskSlot: number;
  matrixTestPresent: boolean;
  contractRegistryHonest: boolean;
  staticAuditPresent: boolean;
  artifactPresent: boolean;
  artifactSchemaValid: boolean;
  matrixHonest: boolean;
  runnerScriptPresent: boolean;
  final16Passed: boolean;
  passed: boolean;
};

function readFinal16ArtifactPassed(root: string): boolean {
  const path = join(root, CROSS_TENANT_ISOLATION_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return false;
  const summary = JSON.parse(readFileSync(path, "utf8")) as {
    version?: string;
    overall?: string;
    proofStatus?: string;
    mockContractPassed?: boolean;
  };
  if (summary.version !== CROSS_TENANT_ISOLATION_SUMMARY_VERSION) return false;
  if (summary.mockContractPassed !== true) return false;
  return (
    summary.overall === "PASS" ||
    (summary.overall === "SKIPPED" &&
      (summary.proofStatus === "proof_skipped_missing_e2e_credentials" ||
        summary.proofStatus === "proof_skipped_playwright_bootstrap" ||
        summary.proofStatus === "proof_passed_mock_contract_staging_skipped"))
  );
}

export function auditWebhookSignatureMatrixTest(root = process.cwd()): boolean {
  const path = join(root, WEBHOOK_SIGNATURE_MATRIX_VITEST_SPEC);
  if (!existsSync(path)) return false;
  const source = readFileSync(path, "utf8");
  return WEBHOOK_SIGNATURE_MATRIX_CONTRACT_MARKERS.every((marker) => source.includes(marker));
}

export function auditFinal17WebhookSignatureMatrix(
  root = process.cwd(),
): Final17WebhookSignatureAuditReport {
  const phase = FINAL_ORCHESTRATOR_PHASES[16]!;
  const matrixTestPresent = existsSync(join(root, WEBHOOK_SIGNATURE_MATRIX_VITEST_SPEC));
  const contractRegistryHonest = matrixTestPresent && auditWebhookSignatureMatrixTest(root);
  const staticAuditPresent = existsSync(join(root, WEBHOOK_SIGNATURE_STATIC_AUDIT_ARTIFACT));

  const artifactPath = join(root, WEBHOOK_SIGNATURE_MATRIX_SUMMARY_ARTIFACT);
  const artifactPresent = existsSync(artifactPath);

  let artifactSchemaValid = false;
  let matrixHonest = false;

  if (artifactPresent) {
    const summary = JSON.parse(readFileSync(artifactPath, "utf8")) as {
      version?: string;
      overall?: string;
      proofStatus?: string;
      matrixVitestPassed?: boolean;
      coreRouteCount?: number;
      ingressRouteCount?: number;
      staticAuditOverall?: string;
      runner?: string;
      honestyNote?: string;
    };

    artifactSchemaValid =
      summary.version === WEBHOOK_SIGNATURE_MATRIX_SUMMARY_VERSION &&
      summary.runner === WEBHOOK_SIGNATURE_MATRIX_RUNNER_SCRIPT &&
      typeof summary.honestyNote === "string" &&
      summary.honestyNote.length > 20 &&
      summary.matrixVitestPassed === true &&
      summary.coreRouteCount === 55 &&
      summary.ingressRouteCount === 59;

    matrixHonest =
      summary.overall === "PASS" &&
      summary.proofStatus === "proof_passed_matrix_and_static_audit";
  }

  const runnerScriptPresent = existsSync(join(root, WEBHOOK_SIGNATURE_MATRIX_RUNNER_SCRIPT));
  const final16Passed = readFinal16ArtifactPassed(root);

  const passed =
    contractRegistryHonest &&
    staticAuditPresent &&
    artifactPresent &&
    artifactSchemaValid &&
    matrixHonest &&
    runnerScriptPresent &&
    final16Passed;

  return {
    policyId: FINAL_17_WEBHOOK_SIGNATURE_POLICY_ID,
    phaseId: "FINAL-17",
    taskSlot: phase.taskSlot,
    matrixTestPresent,
    contractRegistryHonest,
    staticAuditPresent,
    artifactPresent,
    artifactSchemaValid,
    matrixHonest,
    runnerScriptPresent,
    final16Passed,
    passed,
  };
}
