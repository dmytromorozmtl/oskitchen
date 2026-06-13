import { expect, test } from "@playwright/test";

import {
  AUTH_E2E_MATRIX_P3_51_CELL_COUNT,
  AUTH_E2E_MATRIX_P3_51_FLOW_STEPS,
  AUTH_E2E_MATRIX_P3_51_POLICY_ID,
  AUTH_E2E_MATRIX_P3_51_ROLES,
  authE2eMatrixRoleIds,
} from "@/lib/qa/auth-e2e-matrix-p3-51-policy";
import {
  AUTH_E2E_MATRIX_P3_51_ROUTE_PROBES,
  buildAuthE2eMatrixP3_51,
  countAllowedRoutesForRole,
  roleIdToStaffTemplate,
  staffTemplateHasCapability,
  validateAuthE2eMatrixP3_51,
} from "@/lib/qa/auth-e2e-matrix-p3-51-measurement";
import { CAPABILITY } from "@/lib/permissions/permission-matrix";

import {
  runAuthE2eMatrixContractStep,
  runAuthE2eMatrixFlow,
} from "./helpers/auth-e2e-matrix-p3-51-flow";
import {
  skipAuthE2eMatrixP3_51IfGateDisabled,
  skipAuthE2eMatrixP3_51IfNotAuthed,
} from "./helpers/auth-e2e-matrix-p3-51-ready";

/**
 * Auth E2E matrix — Owner, Manager, Cashier, Chef, Driver.
 *
 * Unit contract: five roles × capability probes aligned to staff templates.
 * E2E smoke: owner (and optional role creds) login + route matrix without denial cards.
 *
 * @see docs/auth-e2e-matrix-p3-51.md
 * @see lib/permissions/permission-matrix.ts
 */

test.describe("auth e2e matrix p3-51 policy", () => {
  test("exports five operator roles including driver", () => {
    expect(AUTH_E2E_MATRIX_P3_51_POLICY_ID).toBe("auth-e2e-matrix-p3-51-v1");
    expect(authE2eMatrixRoleIds()).toEqual([
      "owner",
      "manager",
      "cashier",
      "chef",
      "driver",
    ]);
    expect(AUTH_E2E_MATRIX_P3_51_ROLES).toHaveLength(5);
    expect(buildAuthE2eMatrixP3_51()).toHaveLength(AUTH_E2E_MATRIX_P3_51_CELL_COUNT);
    expect(validateAuthE2eMatrixP3_51().passed).toBe(true);
  });

  test("driver assigns routes but cannot operate POS or bump kitchen", () => {
    const driverTemplate = roleIdToStaffTemplate("driver");
    expect(staffTemplateHasCapability(driverTemplate, CAPABILITY.routesAssign)).toBe(true);
    expect(staffTemplateHasCapability(driverTemplate, CAPABILITY.posOperate)).toBe(false);
    expect(staffTemplateHasCapability(driverTemplate, CAPABILITY.kitchenBump)).toBe(false);
    expect(countAllowedRoutesForRole("driver")).toBeGreaterThanOrEqual(2);
  });

  test("cashier operates POS but cannot access kitchen or routes", () => {
    const cashierTemplate = roleIdToStaffTemplate("cashier");
    expect(staffTemplateHasCapability(cashierTemplate, CAPABILITY.posOperate)).toBe(true);
    expect(staffTemplateHasCapability(cashierTemplate, CAPABILITY.kitchenBump)).toBe(false);
    expect(staffTemplateHasCapability(cashierTemplate, CAPABILITY.routesAssign)).toBe(false);
  });

  test("chef bumps kitchen but cannot manage billing or delivery routes", () => {
    const chefTemplate = roleIdToStaffTemplate("chef");
    expect(staffTemplateHasCapability(chefTemplate, CAPABILITY.kitchenBump)).toBe(true);
    expect(staffTemplateHasCapability(chefTemplate, CAPABILITY.billingManage)).toBe(false);
    expect(staffTemplateHasCapability(chefTemplate, CAPABILITY.routesAssign)).toBe(false);
  });

  test("route probes include delivery routes for driver", () => {
    const routesProbe = AUTH_E2E_MATRIX_P3_51_ROUTE_PROBES.find(
      (probe) => probe.path === "/dashboard/routes",
    );
    expect(routesProbe?.allowed.driver).toBe(true);
    expect(routesProbe?.allowed.chef).toBe(false);
  });
});

test.describe("auth e2e matrix contract step", () => {
  test("validates five-role staff template contract", () => {
    const result = runAuthE2eMatrixContractStep();
    expect(result.matrixValid).toBe(true);
    expect(result.mismatchCount).toBe(0);
  });
});

test.describe("auth e2e matrix owner smoke (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Auth E2E matrix owner smoke runs in chromium-authed project only",
    );
    skipAuthE2eMatrixP3_51IfGateDisabled();
    skipAuthE2eMatrixP3_51IfNotAuthed();
  });

  test("owner login reaches allowed routes without permission-denied cards", async ({ page }) => {
    const result = await runAuthE2eMatrixFlow(page);
    if (result.routesVisited === 0 && result.steps.length === 1) {
      test.skip(true, "Auth E2E matrix owner smoke unavailable — auth required.");
    }

    expect(result.matrixValid).toBe(true);
    expect(result.steps).toContain("owner_login_smoke");
    expect(result.routesVisited).toBeGreaterThanOrEqual(4);
    expect(result.routesDenied).toEqual([]);
    expect(result.steps.slice(0, 2)).toEqual([
      AUTH_E2E_MATRIX_P3_51_FLOW_STEPS[0],
      AUTH_E2E_MATRIX_P3_51_FLOW_STEPS[1],
    ]);
  });
});
