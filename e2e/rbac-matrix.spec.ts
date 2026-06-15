import { expect, test } from "@playwright/test";

import {
  RBAC_MATRIX_CAPABILITIES,
  RBAC_MATRIX_CELL_COUNT,
  RBAC_MATRIX_E2E_POLICY_ID,
  RBAC_MATRIX_ROLES,
  buildRbacMatrix15x30,
  countAllowedCapabilitiesForRole,
  ownerHasAllMatrixCapabilities,
  staffRoleHasMatrixCapability,
} from "@/lib/security/rbac-matrix-e2e-policy";
import { CAPABILITY } from "@/lib/permissions/permission-matrix";
import { workspacePermissionsFromStaffTemplate } from "@/lib/permissions/staff-template-workspace-permissions";
import { hasPermission } from "@/lib/permissions/guards";

import { runRbacMatrixOwnerSmokeFlow } from "./helpers/rbac-matrix-flow";
import { skipRbacMatrixIfNotAuthed } from "./helpers/rbac-matrix-ready";

/**
 * RBAC matrix 15×30 — staff templates × capabilities.
 *
 * Unit contract: 450 matrix cells from permission-matrix.ts.
 * E2E smoke: owner reaches capability-gated dashboard routes without denial cards.
 *
 * @see lib/permissions/permission-matrix.ts
 * @see lib/ux/permission-denied-page-access-era19.ts
 */

test.describe("rbac matrix 15x30 policy", () => {
  test("exports 15 roles and 30 capabilities (450 cells)", () => {
    expect(RBAC_MATRIX_E2E_POLICY_ID).toBe("rbac-matrix-15x30-e2e-v1");
    expect(RBAC_MATRIX_ROLES).toHaveLength(15);
    expect(RBAC_MATRIX_CAPABILITIES).toHaveLength(30);
    expect(RBAC_MATRIX_CELL_COUNT).toBe(450);
    expect(buildRbacMatrix15x30()).toHaveLength(450);
    expect(ownerHasAllMatrixCapabilities()).toBe(true);
  });

  test("kitchen and packing roles gate POS manage capability", () => {
    expect(staffRoleHasMatrixCapability("PACKER", CAPABILITY.packingVerify)).toBe(true);
    expect(staffRoleHasMatrixCapability("PACKER", CAPABILITY.posManage)).toBe(false);
    expect(staffRoleHasMatrixCapability("PREP_COOK", CAPABILITY.kitchenBump)).toBe(true);
    expect(staffRoleHasMatrixCapability("PREP_COOK", CAPABILITY.staffManage)).toBe(false);
    expect(staffRoleHasMatrixCapability("VIEWER", CAPABILITY.ordersRead)).toBe(true);
    expect(staffRoleHasMatrixCapability("VIEWER", CAPABILITY.ordersWrite)).toBe(false);
  });

  test("staff template resolves workspace permissions for manager", () => {
    const granted = workspacePermissionsFromStaffTemplate("MANAGER", "STAFF");
    expect(hasPermission(granted, "orders.manage")).toBe(true);
    expect(hasPermission(granted, "kitchen.bump")).toBe(true);
    expect(hasPermission(granted, "go-live.unlock")).toBe(false);
  });

  test("viewer role has read-only matrix footprint", () => {
    expect(countAllowedCapabilitiesForRole("VIEWER")).toBeLessThan(countAllowedCapabilitiesForRole("MANAGER"));
    expect(staffRoleHasMatrixCapability("VIEWER", CAPABILITY.integrationsRead)).toBe(true);
    expect(staffRoleHasMatrixCapability("VIEWER", CAPABILITY.integrationsManage)).toBe(false);
  });
});

test.describe("rbac matrix owner smoke (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "RBAC matrix owner smoke runs in chromium-authed project only",
    );
    skipRbacMatrixIfNotAuthed();
  });

  test("owner reaches capability-gated routes without permission-denied cards", async ({ page }) => {
    const result = await runRbacMatrixOwnerSmokeFlow(page);
    if (!result) {
      test.skip(true, "RBAC matrix owner smoke unavailable — auth required.");
    }

    expect(result.routesVisited).toBeGreaterThanOrEqual(8);
    expect(result.routesDenied).toEqual([]);
  });
});
