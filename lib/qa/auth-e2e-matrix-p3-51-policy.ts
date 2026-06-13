/**
 * Blueprint P3-51 — Auth E2E matrix (Owner, Manager, Cashier, Chef, Driver).
 *
 * @see e2e/auth-e2e-matrix-p3-51.spec.ts
 * @see docs/auth-e2e-matrix-p3-51.md
 */

import type { StaffRoleType } from "@prisma/client";

import { PERMISSION_DENIED_CARD_TESTID } from "@/lib/security/rbac-matrix-e2e-policy";

export const AUTH_E2E_MATRIX_P3_51_POLICY_ID = "auth-e2e-matrix-p3-51-v1" as const;

export const AUTH_E2E_MATRIX_P3_51_DOC = "docs/auth-e2e-matrix-p3-51.md" as const;

export const AUTH_E2E_MATRIX_P3_51_ARTIFACT =
  "artifacts/auth-e2e-matrix-p3-51-registry.json" as const;

export const AUTH_E2E_MATRIX_P3_51_SPEC = "e2e/auth-e2e-matrix-p3-51.spec.ts" as const;

export const AUTH_E2E_MATRIX_P3_51_FLOW_HELPER =
  "e2e/helpers/auth-e2e-matrix-p3-51-flow.ts" as const;

export const AUTH_E2E_MATRIX_P3_51_READY_HELPER =
  "e2e/helpers/auth-e2e-matrix-p3-51-ready.ts" as const;

export const AUTH_E2E_MATRIX_P3_51_AUDIT_SCRIPT =
  "scripts/audit-auth-e2e-matrix-p3-51.ts" as const;

export const AUTH_E2E_MATRIX_P3_51_NPM_SCRIPT = "audit:auth-e2e-matrix-p3-51" as const;

export const AUTH_E2E_MATRIX_P3_51_CHECK_NPM_SCRIPT = "check:auth-e2e-matrix-p3-51" as const;

export const AUTH_E2E_MATRIX_P3_51_UNIT_TEST =
  "tests/unit/auth-e2e-matrix-p3-51.test.ts" as const;

export const AUTH_E2E_MATRIX_P3_51_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const AUTH_E2E_MATRIX_P3_51_LOGIN_PATH = "/login" as const;

export const AUTH_E2E_MATRIX_P3_51_DASHBOARD_PATH = "/dashboard" as const;

/** Five operator personas under test. */
export const AUTH_E2E_MATRIX_P3_51_ROLES = [
  {
    id: "owner",
    label: "Owner",
    staffTemplate: "OWNER",
    emailEnv: "E2E_LOGIN_EMAIL",
    passwordEnv: "E2E_LOGIN_PASSWORD",
  },
  {
    id: "manager",
    label: "Manager",
    staffTemplate: "MANAGER",
    emailEnv: "E2E_AUTH_MANAGER_EMAIL",
    passwordEnv: "E2E_AUTH_MANAGER_PASSWORD",
  },
  {
    id: "cashier",
    label: "Cashier",
    staffTemplate: "CUSTOMER_SERVICE",
    emailEnv: "E2E_AUTH_CASHIER_EMAIL",
    passwordEnv: "E2E_AUTH_CASHIER_PASSWORD",
  },
  {
    id: "chef",
    label: "Chef",
    staffTemplate: "PREP_COOK",
    emailEnv: "E2E_AUTH_CHEF_EMAIL",
    passwordEnv: "E2E_AUTH_CHEF_PASSWORD",
  },
  {
    id: "driver",
    label: "Driver",
    staffTemplate: "DRIVER",
    emailEnv: "E2E_AUTH_DRIVER_EMAIL",
    passwordEnv: "E2E_AUTH_DRIVER_PASSWORD",
  },
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  staffTemplate: StaffRoleType;
  emailEnv: string;
  passwordEnv: string;
}>;

export type AuthE2eMatrixRoleId = (typeof AUTH_E2E_MATRIX_P3_51_ROLES)[number]["id"];

export const AUTH_E2E_MATRIX_P3_51_FLOW_STEPS = [
  "validate_auth_matrix_contract",
  "owner_login_smoke",
  "role_route_matrix_smoke",
] as const;

export const AUTH_E2E_MATRIX_P3_51_WIRING_PATHS = [
  AUTH_E2E_MATRIX_P3_51_DOC,
  "lib/qa/auth-e2e-matrix-p3-51-measurement.ts",
  "lib/qa/auth-e2e-matrix-p3-51-audit.ts",
  AUTH_E2E_MATRIX_P3_51_SPEC,
  AUTH_E2E_MATRIX_P3_51_FLOW_HELPER,
  AUTH_E2E_MATRIX_P3_51_READY_HELPER,
  AUTH_E2E_MATRIX_P3_51_UNIT_TEST,
  AUTH_E2E_MATRIX_P3_51_ARTIFACT,
] as const;

export { PERMISSION_DENIED_CARD_TESTID };

export function isAuthE2eMatrixP3_51Enabled(): boolean {
  return process.env.E2E_AUTH_E2E_MATRIX?.trim() === "true";
}

export function hasOwnerAuthE2eMatrixCredentials(): boolean {
  return Boolean(
    process.env.E2E_LOGIN_EMAIL?.trim() && process.env.E2E_LOGIN_PASSWORD?.trim(),
  );
}

export function authE2eMatrixRoleIds(): AuthE2eMatrixRoleId[] {
  return AUTH_E2E_MATRIX_P3_51_ROLES.map((role) => role.id);
}
