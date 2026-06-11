import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { auditRolePermissionsMatrixE2E } from "@/lib/qa/role-permissions-matrix-e2e-audit";
import {
  ROLE_PERMISSIONS_MATRIX_AUDIT_SCRIPT,
  ROLE_PERMISSIONS_MATRIX_CELL_COUNT,
  ROLE_PERMISSIONS_MATRIX_CI_WORKFLOW,
  ROLE_PERMISSIONS_MATRIX_E2E_POLICY_ID,
  ROLE_PERMISSIONS_MATRIX_E2E_SPEC,
  ROLE_PERMISSIONS_MATRIX_FLOW_STEPS,
  ROLE_PERMISSIONS_MATRIX_NPM_SCRIPT,
  ROLE_PERMISSIONS_MATRIX_ROLES,
  ROLE_PERMISSIONS_MATRIX_UNIT_TEST,
  buildRolePermissionsMatrix,
  countAllowedProbesForRole,
  hasRolePermissionsMatrixCredentials,
  isRolePermissionsMatrixE2EEnabled,
  roleIdToStaffTemplate,
  validateRolePermissionsMatrix,
} from "@/lib/qa/role-permissions-matrix-e2e-policy";
import { CAPABILITY } from "@/lib/permissions/permission-matrix";

const ROOT = process.cwd();

describe("Role permissions matrix E2E (P1-50)", () => {
  it("locks policy id and four operator roles", () => {
    expect(ROLE_PERMISSIONS_MATRIX_E2E_POLICY_ID).toBe("role-permissions-matrix-e2e-v1");
    expect(ROLE_PERMISSIONS_MATRIX_ROLES).toHaveLength(4);
    expect(ROLE_PERMISSIONS_MATRIX_CELL_COUNT).toBe(24);
    expect(ROLE_PERMISSIONS_MATRIX_FLOW_STEPS).toEqual([
      "validate_matrix_contract",
      "owner_route_smoke",
    ]);
  });

  it("maps operator roles to staff templates", () => {
    expect(roleIdToStaffTemplate("owner")).toBe("OWNER");
    expect(roleIdToStaffTemplate("manager")).toBe("MANAGER");
    expect(roleIdToStaffTemplate("chef")).toBe("PREP_COOK");
    expect(roleIdToStaffTemplate("cashier")).toBe("CUSTOMER_SERVICE");
  });

  it("validates cashier/chef/manager/owner capability contract", () => {
    const validation = validateRolePermissionsMatrix();
    expect(validation.passed).toBe(true);
    expect(validation.mismatches).toEqual([]);

    const cells = buildRolePermissionsMatrix();
    expect(cells.every((cell) => cell.expected === cell.actual)).toBe(true);
    expect(countAllowedProbesForRole("owner")).toBe(6);
    expect(countAllowedProbesForRole("cashier")).toBeLessThan(countAllowedProbesForRole("manager"));
  });

  it("chef cannot operate POS; cashier cannot bump kitchen", () => {
    const chefCells = buildRolePermissionsMatrix().filter((cell) => cell.roleId === "chef");
    const cashierCells = buildRolePermissionsMatrix().filter((cell) => cell.roleId === "cashier");

    expect(
      chefCells.find((cell) => cell.capability === CAPABILITY.posOperate)?.actual,
    ).toBe(false);
    expect(
      cashierCells.find((cell) => cell.capability === CAPABILITY.kitchenBump)?.actual,
    ).toBe(false);
  });

  it("audits E2E spec, flow helper, and permission matrix wiring", () => {
    const summary = auditRolePermissionsMatrixE2E(ROOT);
    expect(summary.specPresent).toBe(true);
    expect(summary.flowHelperPresent).toBe(true);
    expect(summary.permissionMatrixWired).toBe(true);
    expect(summary.matrixContractValid).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, ROLE_PERMISSIONS_MATRIX_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, ROLE_PERMISSIONS_MATRIX_E2E_SPEC))).toBe(true);
    expect(existsSync(join(ROOT, ROLE_PERMISSIONS_MATRIX_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[ROLE_PERMISSIONS_MATRIX_NPM_SCRIPT]).toContain(
      "audit-role-permissions-matrix-e2e.ts",
    );
    expect(pkg.scripts?.["test:ci:role-permissions-matrix-e2e"]).toContain(
      ROLE_PERMISSIONS_MATRIX_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, ROLE_PERMISSIONS_MATRIX_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:role-permissions-matrix-e2e");
  });

  it("E2E gate requires E2E_ROLE_PERMISSIONS_MATRIX flag", () => {
    const original = process.env.E2E_ROLE_PERMISSIONS_MATRIX;
    delete process.env.E2E_ROLE_PERMISSIONS_MATRIX;
    expect(isRolePermissionsMatrixE2EEnabled()).toBe(false);
    process.env.E2E_ROLE_PERMISSIONS_MATRIX = "true";
    expect(isRolePermissionsMatrixE2EEnabled()).toBe(true);
    if (original !== undefined) process.env.E2E_ROLE_PERMISSIONS_MATRIX = original;
    else delete process.env.E2E_ROLE_PERMISSIONS_MATRIX;
  });

  it("credentials gate is false without E2E env", () => {
    const originalEmail = process.env.E2E_LOGIN_EMAIL;
    const originalPassword = process.env.E2E_LOGIN_PASSWORD;
    delete process.env.E2E_LOGIN_EMAIL;
    delete process.env.E2E_LOGIN_PASSWORD;
    expect(hasRolePermissionsMatrixCredentials()).toBe(false);
    if (originalEmail !== undefined) process.env.E2E_LOGIN_EMAIL = originalEmail;
    if (originalPassword !== undefined) process.env.E2E_LOGIN_PASSWORD = originalPassword;
  });
});
