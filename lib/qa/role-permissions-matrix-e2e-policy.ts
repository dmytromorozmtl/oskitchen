/**
 * Blueprint P1-50 — Role permissions matrix (cashier / chef / manager / owner).
 *
 * @see e2e/role-permissions-matrix.spec.ts
 * @see lib/permissions/permission-matrix.ts
 * @see lib/security/rbac-matrix-e2e-policy.ts
 */

import type { StaffRoleType } from "@prisma/client";

import {
  CAPABILITY,
  STAFF_TEMPLATE_CAPABILITIES,
  type CapabilityKey,
} from "@/lib/permissions/permission-matrix";
import { PERMISSION_DENIED_CARD_TESTID } from "@/lib/security/rbac-matrix-e2e-policy";

export const ROLE_PERMISSIONS_MATRIX_E2E_POLICY_ID =
  "role-permissions-matrix-e2e-v1" as const;

/** Operator-facing roles under test — mapped to staff templates. */
export const ROLE_PERMISSIONS_MATRIX_ROLES = [
  { id: "owner", label: "Owner", staffTemplate: "OWNER" },
  { id: "manager", label: "Manager", staffTemplate: "MANAGER" },
  { id: "chef", label: "Chef", staffTemplate: "PREP_COOK" },
  { id: "cashier", label: "Cashier", staffTemplate: "CUSTOMER_SERVICE" },
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  staffTemplate: StaffRoleType;
}>;

export type RolePermissionsMatrixRoleId =
  (typeof ROLE_PERMISSIONS_MATRIX_ROLES)[number]["id"];

export type RolePermissionsMatrixProbe = {
  capability: CapabilityKey;
  label: string;
  allowed: Record<RolePermissionsMatrixRoleId, boolean>;
};

/** Critical capability probes — POS, kitchen, staff, billing. */
export const ROLE_PERMISSIONS_MATRIX_PROBES: readonly RolePermissionsMatrixProbe[] = [
  {
    capability: CAPABILITY.posOperate,
    label: "POS operate",
    allowed: { owner: true, manager: true, chef: false, cashier: true },
  },
  {
    capability: CAPABILITY.kitchenBump,
    label: "Kitchen bump",
    allowed: { owner: true, manager: true, chef: true, cashier: false },
  },
  {
    capability: CAPABILITY.staffManage,
    label: "Staff manage",
    allowed: { owner: true, manager: true, chef: false, cashier: false },
  },
  {
    capability: CAPABILITY.billingManage,
    label: "Billing manage",
    allowed: { owner: true, manager: false, chef: false, cashier: false },
  },
  {
    capability: CAPABILITY.ordersWrite,
    label: "Orders write",
    allowed: { owner: true, manager: true, chef: false, cashier: true },
  },
  {
    capability: CAPABILITY.integrationsManage,
    label: "Integrations manage",
    allowed: { owner: true, manager: true, chef: false, cashier: false },
  },
] as const;

export type RolePermissionsMatrixRouteProbe = {
  path: string;
  label: string;
  capability: CapabilityKey;
  allowed: Record<RolePermissionsMatrixRoleId, boolean>;
};

export const ROLE_PERMISSIONS_MATRIX_ROUTE_PROBES: readonly RolePermissionsMatrixRouteProbe[] = [
  {
    path: "/dashboard/pos/terminal",
    label: "POS terminal",
    capability: CAPABILITY.posOperate,
    allowed: { owner: true, manager: true, chef: false, cashier: true },
  },
  {
    path: "/dashboard/kitchen",
    label: "Kitchen display",
    capability: CAPABILITY.kitchenView,
    allowed: { owner: true, manager: true, chef: true, cashier: false },
  },
  {
    path: "/dashboard/staff",
    label: "Staff hub",
    capability: CAPABILITY.staffManage,
    allowed: { owner: true, manager: true, chef: false, cashier: false },
  },
  {
    path: "/dashboard/billing",
    label: "Billing hub",
    capability: CAPABILITY.billingManage,
    allowed: { owner: true, manager: false, chef: false, cashier: false },
  },
] as const;

export const ROLE_PERMISSIONS_MATRIX_CELL_COUNT =
  ROLE_PERMISSIONS_MATRIX_ROLES.length * ROLE_PERMISSIONS_MATRIX_PROBES.length;

export const ROLE_PERMISSIONS_MATRIX_E2E_SPEC =
  "e2e/role-permissions-matrix.spec.ts" as const;
export const ROLE_PERMISSIONS_MATRIX_FLOW_HELPER =
  "e2e/helpers/role-permissions-matrix-flow.ts" as const;
export const ROLE_PERMISSIONS_MATRIX_READY_HELPER =
  "e2e/helpers/role-permissions-matrix-ready.ts" as const;
export const ROLE_PERMISSIONS_MATRIX_AUDIT_SCRIPT =
  "scripts/audit-role-permissions-matrix-e2e.ts" as const;
export const ROLE_PERMISSIONS_MATRIX_NPM_SCRIPT =
  "audit:role-permissions-matrix-e2e" as const;
export const ROLE_PERMISSIONS_MATRIX_UNIT_TEST =
  "tests/unit/role-permissions-matrix-e2e.test.ts" as const;
export const ROLE_PERMISSIONS_MATRIX_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const ROLE_PERMISSIONS_MATRIX_FLOW_STEPS = [
  "validate_matrix_contract",
  "owner_route_smoke",
] as const;

export type RolePermissionsMatrixFlowStep =
  (typeof ROLE_PERMISSIONS_MATRIX_FLOW_STEPS)[number];

export type RolePermissionsMatrixCell = {
  roleId: RolePermissionsMatrixRoleId;
  staffTemplate: StaffRoleType;
  capability: CapabilityKey;
  expected: boolean;
  actual: boolean;
};

export function staffTemplateHasCapability(
  staffTemplate: StaffRoleType,
  capability: CapabilityKey,
): boolean {
  const granted = STAFF_TEMPLATE_CAPABILITIES[staffTemplate] ?? [];
  return granted.includes(capability);
}

export function roleIdToStaffTemplate(roleId: RolePermissionsMatrixRoleId): StaffRoleType {
  const role = ROLE_PERMISSIONS_MATRIX_ROLES.find((entry) => entry.id === roleId);
  if (!role) {
    throw new Error(`Unknown role permissions matrix role: ${roleId}`);
  }
  return role.staffTemplate;
}

export function buildRolePermissionsMatrix(): RolePermissionsMatrixCell[] {
  return ROLE_PERMISSIONS_MATRIX_ROLES.flatMap((role) =>
    ROLE_PERMISSIONS_MATRIX_PROBES.map((probe) => ({
      roleId: role.id,
      staffTemplate: role.staffTemplate,
      capability: probe.capability,
      expected: probe.allowed[role.id],
      actual: staffTemplateHasCapability(role.staffTemplate, probe.capability),
    })),
  );
}

export function validateRolePermissionsMatrix(): {
  passed: boolean;
  mismatches: RolePermissionsMatrixCell[];
} {
  const cells = buildRolePermissionsMatrix();
  const mismatches = cells.filter((cell) => cell.expected !== cell.actual);
  return { passed: mismatches.length === 0, mismatches };
}

export function countAllowedProbesForRole(roleId: RolePermissionsMatrixRoleId): number {
  return ROLE_PERMISSIONS_MATRIX_PROBES.filter((probe) => probe.allowed[roleId]).length;
}

export { PERMISSION_DENIED_CARD_TESTID };

export function hasRolePermissionsMatrixCredentials(): boolean {
  return Boolean(
    process.env.E2E_LOGIN_EMAIL?.trim() && process.env.E2E_LOGIN_PASSWORD?.trim(),
  );
}

export function isRolePermissionsMatrixE2EEnabled(): boolean {
  return process.env.E2E_ROLE_PERMISSIONS_MATRIX?.trim() === "true";
}
