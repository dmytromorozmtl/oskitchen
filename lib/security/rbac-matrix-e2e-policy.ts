/**
 * RBAC matrix 15×30 E2E policy (QA-23).
 *
 * 15 staff templates × 30 capability keys — declarative contract for page and mutation gates.
 *
 * @see e2e/rbac-matrix.spec.ts
 * @see lib/permissions/permission-matrix.ts
 * @see lib/permissions/staff-template-workspace-permissions.ts
 */

import type { StaffRoleType } from "@prisma/client";

import { CAPABILITY, STAFF_TEMPLATE_CAPABILITIES, type CapabilityKey } from "@/lib/permissions/permission-matrix";

export const RBAC_MATRIX_E2E_POLICY_ID = "rbac-matrix-15x30-e2e-v1" as const;

/** All 15 system staff templates from `lib/staff/staff-roles.ts`. */
export const RBAC_MATRIX_ROLES = [
  "OWNER",
  "MANAGER",
  "KITCHEN_LEAD",
  "PREP_COOK",
  "LINE_COOK",
  "PACKER",
  "DRIVER",
  "CUSTOMER_SERVICE",
  "CATERING_COORDINATOR",
  "PURCHASING",
  "INVENTORY",
  "ACCOUNTING",
  "MARKETING",
  "VIEWER",
  "CUSTOM",
] as const satisfies readonly StaffRoleType[];

/**
 * 30 capability keys under test — excludes platform-only / audit PII caps from the full 34-key catalog.
 */
export const RBAC_MATRIX_CAPABILITIES = [
  CAPABILITY.ordersRead,
  CAPABILITY.ordersWrite,
  CAPABILITY.ordersCancel,
  CAPABILITY.posOperate,
  CAPABILITY.posCloseShift,
  CAPABILITY.posManage,
  CAPABILITY.productionRun,
  CAPABILITY.kitchenView,
  CAPABILITY.kitchenBump,
  CAPABILITY.kitchenRecall,
  CAPABILITY.kitchenConfigure,
  CAPABILITY.kitchenExpoManage,
  CAPABILITY.packingVerify,
  CAPABILITY.routesAssign,
  CAPABILITY.inventoryRead,
  CAPABILITY.inventoryWrite,
  CAPABILITY.staffManage,
  CAPABILITY.billingManage,
  CAPABILITY.integrationsRead,
  CAPABILITY.integrationsManage,
  CAPABILITY.storefrontPublish,
  CAPABILITY.storefrontMedia,
  CAPABILITY.storefrontManage,
  CAPABILITY.reportsReadOperations,
  CAPABILITY.reportsReadFinancial,
  CAPABILITY.exportsSensitive,
  CAPABILITY.giftCardsManage,
  CAPABILITY.loyaltyManage,
  CAPABILITY.crmCustomersRead,
  CAPABILITY.crmCustomersManage,
] as const satisfies readonly CapabilityKey[];

export type RbacMatrixRole = (typeof RBAC_MATRIX_ROLES)[number];
export type RbacMatrixCapability = (typeof RBAC_MATRIX_CAPABILITIES)[number];

export const RBAC_MATRIX_CELL_COUNT =
  RBAC_MATRIX_ROLES.length * RBAC_MATRIX_CAPABILITIES.length;

export const PERMISSION_DENIED_CARD_TESTID = "permission-denied-card" as const;

/** Owner smoke routes — each maps to a capability enforced via page-access helpers. */
export const RBAC_MATRIX_OWNER_SMOKE_ROUTES = [
  { path: "/dashboard/order-hub", label: "Order hub", capability: CAPABILITY.ordersWrite },
  { path: "/dashboard/production", label: "Production board", capability: CAPABILITY.productionRun },
  { path: "/dashboard/kitchen", label: "Kitchen display", capability: CAPABILITY.kitchenView },
  { path: "/dashboard/packing", label: "Packing command", capability: CAPABILITY.packingVerify },
  { path: "/dashboard/pos/terminal", label: "POS terminal", capability: CAPABILITY.posOperate },
  {
    path: "/dashboard/integration-health",
    label: "Integration health",
    capability: CAPABILITY.integrationsRead,
  },
  { path: "/dashboard/staff", label: "Staff hub", capability: CAPABILITY.staffManage },
  { path: "/dashboard/reports", label: "Reports hub", capability: CAPABILITY.reportsReadOperations },
  { path: "/dashboard/customers", label: "CRM customers", capability: CAPABILITY.crmCustomersRead },
  { path: "/dashboard/billing", label: "Billing hub", capability: CAPABILITY.billingManage },
] as const;

export type RbacMatrixCell = {
  role: RbacMatrixRole;
  capability: RbacMatrixCapability;
  allowed: boolean;
};

export function staffRoleHasMatrixCapability(
  role: RbacMatrixRole,
  capability: RbacMatrixCapability,
): boolean {
  const granted = STAFF_TEMPLATE_CAPABILITIES[role] ?? [];
  return granted.includes(capability);
}

export function buildRbacMatrix15x30(): RbacMatrixCell[] {
  return RBAC_MATRIX_ROLES.flatMap((role) =>
    RBAC_MATRIX_CAPABILITIES.map((capability) => ({
      role,
      capability,
      allowed: staffRoleHasMatrixCapability(role, capability),
    })),
  );
}

export function countAllowedCapabilitiesForRole(role: RbacMatrixRole): number {
  return RBAC_MATRIX_CAPABILITIES.filter((capability) =>
    staffRoleHasMatrixCapability(role, capability),
  ).length;
}

export function ownerHasAllMatrixCapabilities(): boolean {
  return RBAC_MATRIX_CAPABILITIES.every((capability) =>
    staffRoleHasMatrixCapability("OWNER", capability),
  );
}
