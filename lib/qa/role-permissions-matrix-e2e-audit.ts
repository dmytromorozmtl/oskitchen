import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  ROLE_PERMISSIONS_MATRIX_AUDIT_SCRIPT,
  ROLE_PERMISSIONS_MATRIX_E2E_POLICY_ID,
  ROLE_PERMISSIONS_MATRIX_E2E_SPEC,
  ROLE_PERMISSIONS_MATRIX_FLOW_HELPER,
  ROLE_PERMISSIONS_MATRIX_FLOW_STEPS,
  ROLE_PERMISSIONS_MATRIX_NPM_SCRIPT,
  ROLE_PERMISSIONS_MATRIX_READY_HELPER,
  ROLE_PERMISSIONS_MATRIX_ROLES,
  ROLE_PERMISSIONS_MATRIX_ROUTE_PROBES,
  ROLE_PERMISSIONS_MATRIX_UNIT_TEST,
  validateRolePermissionsMatrix,
} from "@/lib/qa/role-permissions-matrix-e2e-policy";

export type RolePermissionsMatrixE2EAuditSummary = {
  policyId: typeof ROLE_PERMISSIONS_MATRIX_E2E_POLICY_ID;
  specPresent: boolean;
  flowHelperPresent: boolean;
  readyHelperPresent: boolean;
  permissionMatrixWired: boolean;
  matrixContractValid: boolean;
  roleCount: number;
  routeProbeCount: number;
  flowStepCount: number;
  passed: boolean;
};

export function auditRolePermissionsMatrixE2E(
  root = process.cwd(),
): RolePermissionsMatrixE2EAuditSummary {
  const specPath = join(root, ROLE_PERMISSIONS_MATRIX_E2E_SPEC);
  const flowPath = join(root, ROLE_PERMISSIONS_MATRIX_FLOW_HELPER);
  const readyPath = join(root, ROLE_PERMISSIONS_MATRIX_READY_HELPER);
  const permissionMatrixPath = join(root, "lib/permissions/permission-matrix.ts");

  const specPresent = existsSync(specPath);
  const flowHelperPresent = existsSync(flowPath);
  const readyHelperPresent = existsSync(readyPath);

  let permissionMatrixWired = false;
  if (existsSync(permissionMatrixPath)) {
    const source = readFileSync(permissionMatrixPath, "utf8");
    permissionMatrixWired =
      source.includes("STAFF_TEMPLATE_CAPABILITIES") &&
      source.includes("CAPABILITY.posOperate") &&
      source.includes("CAPABILITY.kitchenBump");
  }

  const matrixContractValid = validateRolePermissionsMatrix().passed;

  const specReferencesPolicy =
    specPresent &&
    (readFileSync(specPath, "utf8").includes(ROLE_PERMISSIONS_MATRIX_E2E_POLICY_ID) ||
      readFileSync(specPath, "utf8").includes("ROLE_PERMISSIONS_MATRIX_E2E_POLICY_ID"));
  const flowReferencesMatrix =
    flowHelperPresent &&
    (readFileSync(flowPath, "utf8").includes("validateRolePermissionsMatrix") ||
      readFileSync(flowPath, "utf8").includes("validate_matrix_contract"));
  const flowReferencesOwnerSmoke =
    flowHelperPresent &&
    (readFileSync(flowPath, "utf8").includes("owner_route_smoke") ||
      readFileSync(flowPath, "utf8").includes("PERMISSION_DENIED_CARD_TESTID"));

  const passed =
    specPresent &&
    flowHelperPresent &&
    readyHelperPresent &&
    permissionMatrixWired &&
    matrixContractValid &&
    specReferencesPolicy &&
    flowReferencesMatrix &&
    flowReferencesOwnerSmoke &&
    ROLE_PERMISSIONS_MATRIX_ROLES.length === 4 &&
    ROLE_PERMISSIONS_MATRIX_ROUTE_PROBES.length >= 4 &&
    ROLE_PERMISSIONS_MATRIX_FLOW_STEPS.length >= 2;

  return {
    policyId: ROLE_PERMISSIONS_MATRIX_E2E_POLICY_ID,
    specPresent,
    flowHelperPresent,
    readyHelperPresent,
    permissionMatrixWired,
    matrixContractValid,
    roleCount: ROLE_PERMISSIONS_MATRIX_ROLES.length,
    routeProbeCount: ROLE_PERMISSIONS_MATRIX_ROUTE_PROBES.length,
    flowStepCount: ROLE_PERMISSIONS_MATRIX_FLOW_STEPS.length,
    passed,
  };
}

export function formatRolePermissionsMatrixAuditLines(
  summary: RolePermissionsMatrixE2EAuditSummary,
): string[] {
  return [
    `Role permissions matrix E2E audit (${summary.policyId})`,
    `Spec: ${summary.specPresent ? "present" : "missing"} (${ROLE_PERMISSIONS_MATRIX_E2E_SPEC})`,
    `Flow helper: ${summary.flowHelperPresent ? "present" : "missing"}`,
    `Ready helper: ${summary.readyHelperPresent ? "present" : "missing"}`,
    `Permission matrix wired: ${summary.permissionMatrixWired ? "yes" : "no"}`,
    `Matrix contract valid: ${summary.matrixContractValid ? "yes" : "no"}`,
    `Roles: ${summary.roleCount} (owner, manager, chef, cashier)`,
    `Route probes: ${summary.routeProbeCount}`,
    `Flow steps: ${summary.flowStepCount}`,
    `Unit test: ${ROLE_PERMISSIONS_MATRIX_UNIT_TEST}`,
    `Audit script: ${ROLE_PERMISSIONS_MATRIX_AUDIT_SCRIPT}`,
    `NPM script: ${ROLE_PERMISSIONS_MATRIX_NPM_SCRIPT}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
