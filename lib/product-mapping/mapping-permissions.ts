import { hasPermission } from "@/lib/permissions/guards";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { workspacePermissionForMappingCapability } from "@/lib/product-mapping/mapping-permission-keys";

export type ProductMappingActorScope = {
  isOwner: boolean;
  role?: string | null;
  email?: string | null;
  granted?: ReadonlySet<PermissionKey>;
  platformBypass?: boolean;
};

export type ProductMappingCapability =
  | "mapping.view"
  | "mapping.create"
  | "mapping.approve"
  | "mapping.reject"
  | "mapping.bulk"
  | "mapping.edit"
  | "mapping.archive"
  | "mapping.alias"
  | "mapping.modifier"
  | "mapping.import"
  | "mapping.audit";

const GRANTS: Record<ProductMappingCapability, string[]> = {
  "mapping.view": [
    "manager", "admin", "accountant", "kitchen_lead", "kitchen",
    "packer", "packing", "driver", "dispatcher", "sales", "viewer",
    "integration_manager",
  ],
  "mapping.create": ["admin", "manager", "integration_manager"],
  "mapping.approve": ["admin", "manager", "integration_manager"],
  "mapping.reject": ["admin", "manager", "integration_manager"],
  "mapping.bulk": ["admin", "manager", "integration_manager"],
  "mapping.edit": ["admin", "manager", "integration_manager"],
  "mapping.archive": ["admin", "manager"],
  "mapping.alias": ["admin", "manager", "integration_manager"],
  "mapping.modifier": ["admin", "manager", "integration_manager"],
  "mapping.import": ["admin", "manager", "integration_manager"],
  "mapping.audit": ["admin", "manager", "accountant"],
};

export function isSuperAdminMapping(scope: ProductMappingActorScope): boolean {
  return Boolean(scope.platformBypass);
}

export function canUseProductMapping(
  scope: ProductMappingActorScope,
  cap: ProductMappingCapability,
): boolean {
  if (isSuperAdminMapping(scope)) return true;
  if (scope.isOwner) return true;

  const canonical = workspacePermissionForMappingCapability(cap);
  if (scope.granted && hasPermission(scope.granted, canonical)) {
    return true;
  }

  const role = (scope.role ?? "").toLowerCase();
  return GRANTS[cap]?.includes(role) ?? false;
}
