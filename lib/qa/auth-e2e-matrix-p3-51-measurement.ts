import type { StaffRoleType } from "@prisma/client";

import {
  AUTH_E2E_MATRIX_P3_51_ROLES,
  type AuthE2eMatrixRoleId,
} from "@/lib/qa/auth-e2e-matrix-p3-51-policy";
import {
  CAPABILITY,
  STAFF_TEMPLATE_CAPABILITIES,
  type CapabilityKey,
} from "@/lib/permissions/permission-matrix";

export type AuthE2eMatrixRouteProbe = {
  path: string;
  label: string;
  capability: CapabilityKey;
  allowed: Record<AuthE2eMatrixRoleId, boolean>;
};

export type AuthE2eMatrixCell = {
  roleId: AuthE2eMatrixRoleId;
  staffTemplate: StaffRoleType;
  capability: CapabilityKey;
  expected: boolean;
  actual: boolean;
};

/** Dashboard routes probed post-login per role. */
export const AUTH_E2E_MATRIX_P3_51_ROUTE_PROBES: readonly AuthE2eMatrixRouteProbe[] = [
  {
    path: "/dashboard/today",
    label: "Today command center",
    capability: CAPABILITY.ordersRead,
    allowed: {
      owner: true,
      manager: true,
      cashier: true,
      chef: true,
      driver: true,
    },
  },
  {
    path: "/dashboard/pos/terminal",
    label: "POS terminal",
    capability: CAPABILITY.posOperate,
    allowed: {
      owner: true,
      manager: true,
      cashier: true,
      chef: false,
      driver: false,
    },
  },
  {
    path: "/dashboard/kitchen",
    label: "Kitchen display",
    capability: CAPABILITY.kitchenView,
    allowed: {
      owner: true,
      manager: true,
      cashier: false,
      chef: true,
      driver: false,
    },
  },
  {
    path: "/dashboard/staff",
    label: "Staff hub",
    capability: CAPABILITY.staffManage,
    allowed: {
      owner: true,
      manager: true,
      cashier: false,
      chef: false,
      driver: false,
    },
  },
  {
    path: "/dashboard/billing",
    label: "Billing hub",
    capability: CAPABILITY.billingManage,
    allowed: {
      owner: true,
      manager: false,
      cashier: false,
      chef: false,
      driver: false,
    },
  },
  {
    path: "/dashboard/routes",
    label: "Delivery routes",
    capability: CAPABILITY.routesAssign,
    allowed: {
      owner: true,
      manager: true,
      cashier: false,
      chef: false,
      driver: true,
    },
  },
] as const;

export const AUTH_E2E_MATRIX_P3_51_CAPABILITY_PROBES = [
  {
    capability: CAPABILITY.posOperate,
    allowed: {
      owner: true,
      manager: true,
      cashier: true,
      chef: false,
      driver: false,
    },
  },
  {
    capability: CAPABILITY.kitchenBump,
    allowed: {
      owner: true,
      manager: true,
      cashier: false,
      chef: true,
      driver: false,
    },
  },
  {
    capability: CAPABILITY.routesAssign,
    allowed: {
      owner: true,
      manager: true,
      cashier: false,
      chef: false,
      driver: true,
    },
  },
  {
    capability: CAPABILITY.staffManage,
    allowed: {
      owner: true,
      manager: true,
      cashier: false,
      chef: false,
      driver: false,
    },
  },
  {
    capability: CAPABILITY.billingManage,
    allowed: {
      owner: true,
      manager: false,
      cashier: false,
      chef: false,
      driver: false,
    },
  },
  {
    capability: CAPABILITY.ordersWrite,
    allowed: {
      owner: true,
      manager: true,
      cashier: true,
      chef: false,
      driver: false,
    },
  },
] as const;

export const AUTH_E2E_MATRIX_P3_51_CELL_COUNT =
  AUTH_E2E_MATRIX_P3_51_ROLES.length * AUTH_E2E_MATRIX_P3_51_CAPABILITY_PROBES.length;

export function staffTemplateHasCapability(
  staffTemplate: StaffRoleType,
  capability: CapabilityKey,
): boolean {
  const granted = STAFF_TEMPLATE_CAPABILITIES[staffTemplate] ?? [];
  return granted.includes(capability);
}

export function roleIdToStaffTemplate(roleId: AuthE2eMatrixRoleId): StaffRoleType {
  const role = AUTH_E2E_MATRIX_P3_51_ROLES.find((entry) => entry.id === roleId);
  if (!role) {
    throw new Error(`Unknown auth E2E matrix role: ${roleId}`);
  }
  return role.staffTemplate;
}

export function buildAuthE2eMatrixP3_51(): AuthE2eMatrixCell[] {
  return AUTH_E2E_MATRIX_P3_51_ROLES.flatMap((role) =>
    AUTH_E2E_MATRIX_P3_51_CAPABILITY_PROBES.map((probe) => ({
      roleId: role.id,
      staffTemplate: role.staffTemplate,
      capability: probe.capability,
      expected: probe.allowed[role.id],
      actual: staffTemplateHasCapability(role.staffTemplate, probe.capability),
    })),
  );
}

export function validateAuthE2eMatrixP3_51(): {
  passed: boolean;
  mismatches: AuthE2eMatrixCell[];
} {
  const cells = buildAuthE2eMatrixP3_51();
  const mismatches = cells.filter((cell) => cell.expected !== cell.actual);
  return { passed: mismatches.length === 0, mismatches };
}

export function resolveAuthE2eMatrixCredentials(
  roleId: AuthE2eMatrixRoleId,
): { email: string; password: string } | null {
  const role = AUTH_E2E_MATRIX_P3_51_ROLES.find((entry) => entry.id === roleId);
  if (!role) return null;

  const email = process.env[role.emailEnv]?.trim();
  const password = process.env[role.passwordEnv]?.trim();
  if (!email || !password) return null;

  return { email, password };
}

export function listRolesWithAuthE2eMatrixCredentials(): AuthE2eMatrixRoleId[] {
  return AUTH_E2E_MATRIX_P3_51_ROLES.filter((role) =>
    Boolean(resolveAuthE2eMatrixCredentials(role.id)),
  ).map((role) => role.id);
}

export function routesAllowedForRole(roleId: AuthE2eMatrixRoleId): AuthE2eMatrixRouteProbe[] {
  return AUTH_E2E_MATRIX_P3_51_ROUTE_PROBES.filter((probe) => probe.allowed[roleId]);
}

export function routesDeniedForRole(roleId: AuthE2eMatrixRoleId): AuthE2eMatrixRouteProbe[] {
  return AUTH_E2E_MATRIX_P3_51_ROUTE_PROBES.filter((probe) => !probe.allowed[roleId]);
}

export function countAllowedRoutesForRole(roleId: AuthE2eMatrixRoleId): number {
  return routesAllowedForRole(roleId).length;
}
