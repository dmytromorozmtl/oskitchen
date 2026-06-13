import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditAuthE2eMatrixP3_51,
  formatAuthE2eMatrixP3_51AuditLines,
} from "@/lib/qa/auth-e2e-matrix-p3-51-audit";
import {
  AUTH_E2E_MATRIX_P3_51_CELL_COUNT,
  buildAuthE2eMatrixP3_51,
  countAllowedRoutesForRole,
  roleIdToStaffTemplate,
  staffTemplateHasCapability,
  validateAuthE2eMatrixP3_51,
} from "@/lib/qa/auth-e2e-matrix-p3-51-measurement";
import {
  AUTH_E2E_MATRIX_P3_51_AUDIT_SCRIPT,
  AUTH_E2E_MATRIX_P3_51_CHECK_NPM_SCRIPT,
  AUTH_E2E_MATRIX_P3_51_CI_WORKFLOW,
  AUTH_E2E_MATRIX_P3_51_DOC,
  AUTH_E2E_MATRIX_P3_51_FLOW_STEPS,
  AUTH_E2E_MATRIX_P3_51_NPM_SCRIPT,
  AUTH_E2E_MATRIX_P3_51_POLICY_ID,
  AUTH_E2E_MATRIX_P3_51_ROLES,
  AUTH_E2E_MATRIX_P3_51_SPEC,
  AUTH_E2E_MATRIX_P3_51_UNIT_TEST,
  authE2eMatrixRoleIds,
  hasOwnerAuthE2eMatrixCredentials,
  isAuthE2eMatrixP3_51Enabled,
} from "@/lib/qa/auth-e2e-matrix-p3-51-policy";
import { CAPABILITY } from "@/lib/permissions/permission-matrix";

const ROOT = process.cwd();

describe("Auth E2E matrix (P3-51)", () => {
  it("locks policy id and five-role matrix", () => {
    expect(AUTH_E2E_MATRIX_P3_51_POLICY_ID).toBe("auth-e2e-matrix-p3-51-v1");
    expect(authE2eMatrixRoleIds()).toEqual([
      "owner",
      "manager",
      "cashier",
      "chef",
      "driver",
    ]);
    expect(AUTH_E2E_MATRIX_P3_51_ROLES).toHaveLength(5);
    expect(AUTH_E2E_MATRIX_P3_51_CELL_COUNT).toBe(30);
    expect(AUTH_E2E_MATRIX_P3_51_FLOW_STEPS).toEqual([
      "validate_auth_matrix_contract",
      "owner_login_smoke",
      "role_route_matrix_smoke",
    ]);
  });

  it("maps personas to staff templates", () => {
    expect(roleIdToStaffTemplate("owner")).toBe("OWNER");
    expect(roleIdToStaffTemplate("manager")).toBe("MANAGER");
    expect(roleIdToStaffTemplate("cashier")).toBe("CUSTOMER_SERVICE");
    expect(roleIdToStaffTemplate("chef")).toBe("PREP_COOK");
    expect(roleIdToStaffTemplate("driver")).toBe("DRIVER");
  });

  it("validates capability contract for all five roles", () => {
    const validation = validateAuthE2eMatrixP3_51();
    expect(validation.passed).toBe(true);
    expect(validation.mismatches).toEqual([]);
    expect(buildAuthE2eMatrixP3_51().every((cell) => cell.expected === cell.actual)).toBe(true);
    expect(countAllowedRoutesForRole("owner")).toBe(6);
    expect(countAllowedRoutesForRole("driver")).toBe(2);
  });

  it("driver routes assign; chef kitchen-only footprint", () => {
    expect(
      staffTemplateHasCapability(roleIdToStaffTemplate("driver"), CAPABILITY.routesAssign),
    ).toBe(true);
    expect(
      staffTemplateHasCapability(roleIdToStaffTemplate("chef"), CAPABILITY.kitchenBump),
    ).toBe(true);
    expect(
      staffTemplateHasCapability(roleIdToStaffTemplate("chef"), CAPABILITY.routesAssign),
    ).toBe(false);
  });

  it("passes full auth E2E matrix audit", () => {
    const summary = auditAuthE2eMatrixP3_51(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.specWired).toBe(true);
    expect(summary.flowWired).toBe(true);
    expect(summary.matrixContractValid).toBe(true);
    expect(summary.fiveRolesPresent).toBe(true);
    expect(summary.driverRouteWired).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatAuthE2eMatrixP3_51AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script and npm wiring", () => {
    expect(existsSync(join(ROOT, AUTH_E2E_MATRIX_P3_51_DOC))).toBe(true);
    expect(existsSync(join(ROOT, AUTH_E2E_MATRIX_P3_51_SPEC))).toBe(true);
    expect(existsSync(join(ROOT, AUTH_E2E_MATRIX_P3_51_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, AUTH_E2E_MATRIX_P3_51_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[AUTH_E2E_MATRIX_P3_51_NPM_SCRIPT]).toContain(
      "audit-auth-e2e-matrix-p3-51.ts",
    );
    expect(pkg.scripts?.[AUTH_E2E_MATRIX_P3_51_CHECK_NPM_SCRIPT]).toContain(
      AUTH_E2E_MATRIX_P3_51_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, AUTH_E2E_MATRIX_P3_51_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("auth-e2e-matrix-p3-51");
  });

  it("E2E gate requires E2E_AUTH_E2E_MATRIX flag", () => {
    const original = process.env.E2E_AUTH_E2E_MATRIX;
    delete process.env.E2E_AUTH_E2E_MATRIX;
    expect(isAuthE2eMatrixP3_51Enabled()).toBe(false);
    process.env.E2E_AUTH_E2E_MATRIX = "true";
    expect(isAuthE2eMatrixP3_51Enabled()).toBe(true);
    if (original !== undefined) process.env.E2E_AUTH_E2E_MATRIX = original;
    else delete process.env.E2E_AUTH_E2E_MATRIX;
  });

  it("owner credentials gate is false without E2E env", () => {
    const originalEmail = process.env.E2E_LOGIN_EMAIL;
    const originalPassword = process.env.E2E_LOGIN_PASSWORD;
    delete process.env.E2E_LOGIN_EMAIL;
    delete process.env.E2E_LOGIN_PASSWORD;
    expect(hasOwnerAuthE2eMatrixCredentials()).toBe(false);
    if (originalEmail !== undefined) process.env.E2E_LOGIN_EMAIL = originalEmail;
    if (originalPassword !== undefined) process.env.E2E_LOGIN_PASSWORD = originalPassword;
  });
});
