import { expect, test } from "@playwright/test";

import {
  ROLE_PERMISSIONS_MATRIX_CELL_COUNT,
  ROLE_PERMISSIONS_MATRIX_E2E_POLICY_ID,
  ROLE_PERMISSIONS_MATRIX_FLOW_STEPS,
  ROLE_PERMISSIONS_MATRIX_PROBES,
  ROLE_PERMISSIONS_MATRIX_ROLES,
  buildRolePermissionsMatrix,
  countAllowedProbesForRole,
  roleIdToStaffTemplate,
  staffTemplateHasCapability,
  validateRolePermissionsMatrix,
} from "@/lib/qa/role-permissions-matrix-e2e-policy";
import { CAPABILITY } from "@/lib/permissions/permission-matrix";

import {
  runRolePermissionsMatrixContractStep,
  runRolePermissionsMatrixFlow,
} from "./helpers/role-permissions-matrix-flow";
import {
  skipRolePermissionsMatrixIfGateDisabled,
  skipRolePermissionsMatrixIfNotAuthed,
} from "./helpers/role-permissions-matrix-ready";

/**
 * Role permissions matrix — cashier / chef / manager / owner access contract.
 *
 * Unit contract: staff templates × critical capability probes.
 * E2E smoke: owner reaches allowed routes without permission-denied cards.
 *
 * @see lib/permissions/permission-matrix.ts
 * @see docs/STAFF_ROLES_PERMISSIONS.md
 */

test.describe("role permissions matrix policy", () => {
  test("exports four operator roles and capability probes", () => {
    expect(ROLE_PERMISSIONS_MATRIX_E2E_POLICY_ID).toBe("role-permissions-matrix-e2e-v1");
    expect(ROLE_PERMISSIONS_MATRIX_ROLES.map((role) => role.id)).toEqual([
      "owner",
      "manager",
      "chef",
      "cashier",
    ]);
    expect(ROLE_PERMISSIONS_MATRIX_PROBES.length).toBeGreaterThanOrEqual(6);
    expect(buildRolePermissionsMatrix()).toHaveLength(ROLE_PERMISSIONS_MATRIX_CELL_COUNT);
    expect(validateRolePermissionsMatrix().passed).toBe(true);
  });

  test("cashier operates POS but cannot bump kitchen tickets", () => {
    const cashierTemplate = roleIdToStaffTemplate("cashier");
    expect(staffTemplateHasCapability(cashierTemplate, CAPABILITY.posOperate)).toBe(true);
    expect(staffTemplateHasCapability(cashierTemplate, CAPABILITY.kitchenBump)).toBe(false);
    expect(staffTemplateHasCapability(cashierTemplate, CAPABILITY.staffManage)).toBe(false);
  });

  test("chef bumps kitchen tickets but cannot manage staff or billing", () => {
    const chefTemplate = roleIdToStaffTemplate("chef");
    expect(staffTemplateHasCapability(chefTemplate, CAPABILITY.kitchenBump)).toBe(true);
    expect(staffTemplateHasCapability(chefTemplate, CAPABILITY.posOperate)).toBe(false);
    expect(staffTemplateHasCapability(chefTemplate, CAPABILITY.staffManage)).toBe(false);
    expect(staffTemplateHasCapability(chefTemplate, CAPABILITY.billingManage)).toBe(false);
  });

  test("manager has broader ops access than cashier but not billing", () => {
    expect(countAllowedProbesForRole("manager")).toBeGreaterThan(
      countAllowedProbesForRole("cashier"),
    );
    expect(countAllowedProbesForRole("owner")).toBeGreaterThan(countAllowedProbesForRole("manager"));

    const managerTemplate = roleIdToStaffTemplate("manager");
    expect(staffTemplateHasCapability(managerTemplate, CAPABILITY.staffManage)).toBe(true);
    expect(staffTemplateHasCapability(managerTemplate, CAPABILITY.billingManage)).toBe(false);
  });

  test("owner grants all matrix probes", () => {
    for (const probe of ROLE_PERMISSIONS_MATRIX_PROBES) {
      expect(probe.allowed.owner).toBe(true);
      expect(
        staffTemplateHasCapability(roleIdToStaffTemplate("owner"), probe.capability),
      ).toBe(true);
    }
  });
});

test.describe("role permissions matrix contract step", () => {
  test("validates staff template capability contract", () => {
    const result = runRolePermissionsMatrixContractStep();
    expect(result.matrixValid).toBe(true);
    expect(result.mismatchCount).toBe(0);
  });
});

test.describe("role permissions matrix owner smoke (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Role permissions matrix owner smoke runs in chromium-authed project only",
    );
    skipRolePermissionsMatrixIfGateDisabled();
    skipRolePermissionsMatrixIfNotAuthed();
  });

  test("owner reaches allowed routes without permission-denied cards", async ({ page }) => {
    const result = await runRolePermissionsMatrixFlow(page);
    if (result.routesVisited === 0 && result.steps.length === 1) {
      test.skip(true, "Role permissions matrix owner smoke unavailable — auth required.");
    }

    expect(result.matrixValid).toBe(true);
    expect(result.steps).toContain("owner_route_smoke");
    expect(result.routesVisited).toBeGreaterThanOrEqual(3);
    expect(result.routesDenied).toEqual([]);
    expect(result.steps).toEqual([...ROLE_PERMISSIONS_MATRIX_FLOW_STEPS]);
  });
});
