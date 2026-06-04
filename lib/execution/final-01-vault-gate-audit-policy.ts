import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditExecutionTrackerReconciliation } from "@/lib/execution/execution-tracker-reconciliation-audit-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";
import {
  VAULT_READINESS_MATRIX_DOC,
  VAULT_READINESS_NPM_SCRIPT,
  VAULT_READINESS_ORCHESTRATOR_SCRIPT,
} from "@/lib/ops/vault-readiness-policy";
import { VAULT_READINESS_REPORT_ARTIFACT } from "@/lib/ops/vault-readiness-report";

/**
 * FINAL-01 — ops vault readiness gate for final execution closure (honest, not inflated).
 */

export const FINAL_01_VAULT_GATE_POLICY_ID = "final-01-vault-gate-v1" as const;

export type Final01VaultGateAuditReport = {
  policyId: typeof FINAL_01_VAULT_GATE_POLICY_ID;
  phaseId: "FINAL-01";
  taskSlot: number;
  vaultReportPresent: boolean;
  vaultSchemaValid: boolean;
  vaultMatrixDocPresent: boolean;
  checkScriptWired: boolean;
  reconciliationPassed: boolean;
  honestP0Status: boolean;
  passed: boolean;
};

function readPackageScripts(root: string): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

export function auditFinal01VaultGate(root = process.cwd()): Final01VaultGateAuditReport {
  const phase = FINAL_ORCHESTRATOR_PHASES[0]!;
  const vaultPath = join(root, VAULT_READINESS_REPORT_ARTIFACT);
  const vaultReportPresent = existsSync(vaultPath);

  let vaultSchemaValid = false;
  let honestP0Status = false;

  if (vaultReportPresent) {
    const report = JSON.parse(readFileSync(vaultPath, "utf8")) as {
      version?: string;
      presentCount?: number;
      totalCount?: number;
      p0ArtifactOverall?: string;
      p0ProofStatus?: string;
      vaultReady?: boolean;
    };
    vaultSchemaValid =
      report.version === "vault-readiness-v2" &&
      typeof report.presentCount === "number" &&
      typeof report.totalCount === "number" &&
      report.totalCount === 11 &&
      typeof report.p0ArtifactOverall === "string" &&
      typeof report.p0ProofStatus === "string";
    honestP0Status =
      report.p0ArtifactOverall === "FAILED" ||
      report.p0ArtifactOverall === "PASSED" ||
      report.p0ProofStatus === "proof_failed" ||
      report.p0ProofStatus === "awaiting_ops_credentials";
  }

  const matrix = readFileSync(join(root, VAULT_READINESS_MATRIX_DOC), "utf8");
  const vaultMatrixDocPresent =
    matrix.includes("Ops Vault Matrix") &&
    matrix.includes("11 secrets") &&
    matrix.includes(VAULT_READINESS_REPORT_ARTIFACT);

  const scripts = readPackageScripts(root);
  const checkScriptWired =
    scripts[VAULT_READINESS_NPM_SCRIPT]?.includes(VAULT_READINESS_ORCHESTRATOR_SCRIPT) ??
    false;

  const reconciliationPassed = auditExecutionTrackerReconciliation(root).passed;

  const passed =
    vaultReportPresent &&
    vaultSchemaValid &&
    vaultMatrixDocPresent &&
    checkScriptWired &&
    reconciliationPassed &&
    honestP0Status;

  return {
    policyId: FINAL_01_VAULT_GATE_POLICY_ID,
    phaseId: "FINAL-01",
    taskSlot: phase.taskSlot,
    vaultReportPresent,
    vaultSchemaValid,
    vaultMatrixDocPresent,
    checkScriptWired,
    reconciliationPassed,
    honestP0Status,
    passed,
  };
}
