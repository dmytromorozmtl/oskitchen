import { describe, expect, it } from "vitest";

import { CAPABILITY, STAFF_TEMPLATE_CAPABILITIES } from "@/lib/permissions/permission-matrix";
import { workspacePermissionsFromStaffTemplate } from "@/lib/permissions/staff-template-workspace-permissions";
import { hasPermission } from "@/lib/permissions/guards";
import {
  RBAC_MATRIX_CAPABILITIES,
  RBAC_MATRIX_CELL_COUNT,
  RBAC_MATRIX_E2E_POLICY_ID,
  RBAC_MATRIX_OWNER_SMOKE_ROUTES,
  RBAC_MATRIX_ROLES,
  buildRbacMatrix15x30,
  countAllowedCapabilitiesForRole,
  ownerHasAllMatrixCapabilities,
  staffRoleHasMatrixCapability,
} from "@/lib/security/rbac-matrix-e2e-policy";

describe("RBAC matrix 15×30 lifecycle (QA-23)", () => {
  it("exports policy id and 450 matrix cells", () => {
    expect(RBAC_MATRIX_E2E_POLICY_ID).toBe("rbac-matrix-15x30-e2e-v1");
    expect(RBAC_MATRIX_ROLES.length * RBAC_MATRIX_CAPABILITIES.length).toBe(RBAC_MATRIX_CELL_COUNT);
    expect(buildRbacMatrix15x30().length).toBe(450);
  });

  it("OWNER grants all 30 matrix capabilities", () => {
    expect(ownerHasAllMatrixCapabilities()).toBe(true);
    expect(countAllowedCapabilitiesForRole("OWNER")).toBe(30);
  });

  it("every staff template maps to a capability bundle", () => {
    for (const role of RBAC_MATRIX_ROLES) {
      expect(STAFF_TEMPLATE_CAPABILITIES[role]).toBeDefined();
      expect(Array.isArray(STAFF_TEMPLATE_CAPABILITIES[role])).toBe(true);
    }
  });

  it("DRIVER can assign routes but cannot manage staff", () => {
    expect(staffRoleHasMatrixCapability("DRIVER", CAPABILITY.routesAssign)).toBe(true);
    expect(staffRoleHasMatrixCapability("DRIVER", CAPABILITY.staffManage)).toBe(false);
  });

  it("ACCOUNTING can read financial reports but not manage integrations", () => {
    expect(staffRoleHasMatrixCapability("ACCOUNTING", CAPABILITY.reportsReadFinancial)).toBe(true);
    expect(staffRoleHasMatrixCapability("ACCOUNTING", CAPABILITY.integrationsManage)).toBe(false);
  });

  it("CUSTOM template falls back to minimal read capability", () => {
    expect(staffRoleHasMatrixCapability("CUSTOM", CAPABILITY.ordersRead)).toBe(true);
    expect(staffRoleHasMatrixCapability("CUSTOM", CAPABILITY.ordersWrite)).toBe(false);
  });

  it("workspace permissions from PURCHASING template include export rights", () => {
    const granted = workspacePermissionsFromStaffTemplate("PURCHASING", "STAFF");
    expect(hasPermission(granted, "reports.export")).toBe(true);
    expect(hasPermission(granted, "staff.manage")).toBe(false);
  });

  it("owner smoke routes each map to a matrix capability", () => {
    for (const route of RBAC_MATRIX_OWNER_SMOKE_ROUTES) {
      expect(staffRoleHasMatrixCapability("OWNER", route.capability)).toBe(true);
    }
  });
});
