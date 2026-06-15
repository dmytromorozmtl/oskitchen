import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditFinal07TrackerReconciliation } from "@/lib/execution/final-07-tracker-reconciliation-audit-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";
import {
  MARKETING_CLAIMS_GOVERNANCE_POLICY_ID,
  MARKETING_CLAIMS_REGISTRY_PATH,
} from "@/lib/governance/marketing-claims-governance-policy";

/**
 * FINAL-08 — marketing claims CI gate re-cert (MKT-09 verify-claims workflow).
 */

export const FINAL_08_FORBIDDEN_CLAIMS_POLICY_ID = "final-08-forbidden-claims-v1" as const;

export const VERIFY_CLAIMS_WORKFLOW_PATH = ".github/workflows/verify-claims.yml" as const;

export const VERIFY_CLAIMS_ORCHESTRATOR_SCRIPT = "scripts/verify-marketing-claims.ts" as const;

export const FORBIDDEN_CLAIMS_TRAINING_DOC = "docs/forbidden-claims-training.md" as const;

export const FORBIDDEN_CLAIMS_ENFORCEMENT_TEST =
  "tests/unit/forbidden-claims-enforcement.test.ts" as const;

export const VERIFY_CLAIMS_NPM_SCRIPT = "verify-claims" as const;

export const VERIFY_CLAIMS_STRICT_ENV = "MARKETING_CLAIMS_STRICT" as const;

export type Final08ForbiddenClaimsAuditReport = {
  policyId: typeof FINAL_08_FORBIDDEN_CLAIMS_POLICY_ID;
  phaseId: "FINAL-08";
  taskSlot: number;
  workflowPresent: boolean;
  workflowStrictGate: boolean;
  governancePolicyPresent: boolean;
  verifyScriptPresent: boolean;
  npmScriptWired: boolean;
  forbiddenTestPresent: boolean;
  trainingDocPresent: boolean;
  mkt09RoleDone: boolean;
  final07Passed: boolean;
  passed: boolean;
};

function readSurface(root: string, relPath: string): string {
  return readFileSync(join(root, relPath), "utf8");
}

function readPackageScripts(root: string): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

function auditVerifyClaimsWorkflow(root: string): { present: boolean; strictGate: boolean } {
  if (!existsSync(join(root, VERIFY_CLAIMS_WORKFLOW_PATH))) {
    return { present: false, strictGate: false };
  }

  const source = readSurface(root, VERIFY_CLAIMS_WORKFLOW_PATH);
  const strictGate =
    source.includes(MARKETING_CLAIMS_GOVERNANCE_POLICY_ID) &&
    source.includes(`npm run ${VERIFY_CLAIMS_NPM_SCRIPT}`) &&
    source.includes(VERIFY_CLAIMS_STRICT_ENV) &&
    source.includes("pull_request") &&
    source.includes("test:ci:forbidden-claims-enforcement") &&
    source.includes("verify-claims-gate.json") &&
    source.includes(FORBIDDEN_CLAIMS_TRAINING_DOC);

  return { present: true, strictGate };
}

function auditGovernancePolicy(root: string): boolean {
  const source = readSurface(root, "lib/governance/marketing-claims-governance-policy.ts");
  return (
    source.includes(MARKETING_CLAIMS_GOVERNANCE_POLICY_ID) &&
    source.includes("MARKETING_CLAIMS_FORBIDDEN_PHRASES") &&
    source.includes(VERIFY_CLAIMS_NPM_SCRIPT) &&
    existsSync(join(root, MARKETING_CLAIMS_REGISTRY_PATH))
  );
}

function auditForbiddenTrainingDoc(root: string): boolean {
  const source = readSurface(root, FORBIDDEN_CLAIMS_TRAINING_DOC);
  return (
    source.includes("verify-claims") &&
    source.includes("forbidden") &&
    source.includes("certification")
  );
}

export function auditFinal08ForbiddenClaims(
  root = process.cwd(),
): Final08ForbiddenClaimsAuditReport {
  const phase = FINAL_ORCHESTRATOR_PHASES[7]!;
  const workflow = auditVerifyClaimsWorkflow(root);
  const governancePolicyPresent = auditGovernancePolicy(root);
  const verifyScriptPresent = existsSync(join(root, VERIFY_CLAIMS_ORCHESTRATOR_SCRIPT));
  const scripts = readPackageScripts(root);
  const npmScriptWired =
    scripts[VERIFY_CLAIMS_NPM_SCRIPT]?.includes(VERIFY_CLAIMS_ORCHESTRATOR_SCRIPT) ?? false;
  const forbiddenTestPresent = existsSync(join(root, FORBIDDEN_CLAIMS_ENFORCEMENT_TEST));
  const trainingDocPresent = auditForbiddenTrainingDoc(root);

  const tracker = JSON.parse(
    readFileSync(join(root, "artifacts/execution-tracker-final.json"), "utf8"),
  ) as Record<string, string>;
  const mkt09RoleDone = tracker["MKT-09"] === "done";

  const final07Passed = auditFinal07TrackerReconciliation(root).passed;

  const passed =
    workflow.present &&
    workflow.strictGate &&
    governancePolicyPresent &&
    verifyScriptPresent &&
    npmScriptWired &&
    forbiddenTestPresent &&
    trainingDocPresent &&
    mkt09RoleDone &&
    final07Passed;

  return {
    policyId: FINAL_08_FORBIDDEN_CLAIMS_POLICY_ID,
    phaseId: "FINAL-08",
    taskSlot: phase.taskSlot,
    workflowPresent: workflow.present,
    workflowStrictGate: workflow.strictGate,
    governancePolicyPresent,
    verifyScriptPresent,
    npmScriptWired,
    forbiddenTestPresent,
    trainingDocPresent,
    mkt09RoleDone,
    final07Passed,
    passed,
  };
}
