import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  AUTH_E2E_MATRIX_P3_51_CAPABILITY_PROBES,
  AUTH_E2E_MATRIX_P3_51_ROUTE_PROBES,
  validateAuthE2eMatrixP3_51,
} from "@/lib/qa/auth-e2e-matrix-p3-51-measurement";
import {
  AUTH_E2E_MATRIX_P3_51_DOC,
  AUTH_E2E_MATRIX_P3_51_FLOW_HELPER,
  AUTH_E2E_MATRIX_P3_51_FLOW_STEPS,
  AUTH_E2E_MATRIX_P3_51_POLICY_ID,
  AUTH_E2E_MATRIX_P3_51_READY_HELPER,
  AUTH_E2E_MATRIX_P3_51_ROLES,
  AUTH_E2E_MATRIX_P3_51_SPEC,
  AUTH_E2E_MATRIX_P3_51_WIRING_PATHS,
} from "@/lib/qa/auth-e2e-matrix-p3-51-policy";

export type AuthE2eMatrixP3_51AuditSummary = {
  policyId: typeof AUTH_E2E_MATRIX_P3_51_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  specWired: boolean;
  flowWired: boolean;
  matrixContractValid: boolean;
  fiveRolesPresent: boolean;
  driverRouteWired: boolean;
  passed: boolean;
};

export function auditAuthE2eMatrixP3_51(root = process.cwd()): AuthE2eMatrixP3_51AuditSummary {
  const wiringComplete = AUTH_E2E_MATRIX_P3_51_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, AUTH_E2E_MATRIX_P3_51_DOC))) {
    const source = readFileSync(join(root, AUTH_E2E_MATRIX_P3_51_DOC), "utf8").toLowerCase();
    docWired =
      source.includes("owner") &&
      source.includes("manager") &&
      source.includes("cashier") &&
      source.includes("chef") &&
      source.includes("driver");
  }

  let specWired = false;
  if (existsSync(join(root, AUTH_E2E_MATRIX_P3_51_SPEC))) {
    const source = readFileSync(join(root, AUTH_E2E_MATRIX_P3_51_SPEC), "utf8");
    specWired =
      source.includes("auth-e2e-matrix-p3-51-v1") &&
      source.includes("runAuthE2eMatrixFlow") &&
      source.includes("owner_login_smoke");
  }

  let flowWired = false;
  if (existsSync(join(root, AUTH_E2E_MATRIX_P3_51_FLOW_HELPER))) {
    const source = readFileSync(join(root, AUTH_E2E_MATRIX_P3_51_FLOW_HELPER), "utf8");
    flowWired =
      source.includes("runAuthE2eMatrixOwnerSmokeStep") &&
      source.includes("loginAsAuthE2eMatrixRole") &&
      existsSync(join(root, AUTH_E2E_MATRIX_P3_51_READY_HELPER));
  }

  const matrixContractValid = validateAuthE2eMatrixP3_51().passed;
  const fiveRolesPresent =
    AUTH_E2E_MATRIX_P3_51_ROLES.length === 5 &&
    AUTH_E2E_MATRIX_P3_51_ROLES.map((role) => role.id).join(",") ===
      "owner,manager,cashier,chef,driver";

  const driverRouteWired = AUTH_E2E_MATRIX_P3_51_ROUTE_PROBES.some(
    (probe) => probe.path === "/dashboard/routes" && probe.allowed.driver,
  );

  const passed =
    wiringComplete &&
    docWired &&
    specWired &&
    flowWired &&
    matrixContractValid &&
    fiveRolesPresent &&
    driverRouteWired &&
    AUTH_E2E_MATRIX_P3_51_CAPABILITY_PROBES.length >= 6 &&
    AUTH_E2E_MATRIX_P3_51_FLOW_STEPS.length === 3;

  return {
    policyId: AUTH_E2E_MATRIX_P3_51_POLICY_ID,
    wiringComplete,
    docWired,
    specWired,
    flowWired,
    matrixContractValid,
    fiveRolesPresent,
    driverRouteWired,
    passed,
  };
}

export function formatAuthE2eMatrixP3_51AuditLines(
  summary: AuthE2eMatrixP3_51AuditSummary,
): string[] {
  return [
    `Auth E2E matrix audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${AUTH_E2E_MATRIX_P3_51_DOC})`,
    `Spec wired: ${summary.specWired ? "yes" : "no"} (${AUTH_E2E_MATRIX_P3_51_SPEC})`,
    `Flow helper: ${summary.flowWired ? "yes" : "no"}`,
    `Matrix contract valid: ${summary.matrixContractValid ? "yes" : "no"}`,
    `Five roles: ${summary.fiveRolesPresent ? "yes" : "no"}`,
    `Driver routes probe: ${summary.driverRouteWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
