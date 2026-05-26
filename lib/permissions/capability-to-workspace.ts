import { CAPABILITY, type CapabilityKey } from "@/lib/permissions/permission-matrix";
import type { PermissionKey } from "@/lib/permissions/permissions";

/** Map declarative capabilities → workspace permission keys (RBAC Phase D). */
export const CAPABILITY_TO_WORKSPACE: Record<CapabilityKey, readonly PermissionKey[]> = {
  [CAPABILITY.ordersRead]: ["workspace.view"],
  [CAPABILITY.ordersWrite]: ["workspace.view", "orders.manage"],
  [CAPABILITY.ordersCancel]: ["workspace.view", "orders.manage"],
  [CAPABILITY.posOperate]: ["workspace.view", "orders.manage"],
  [CAPABILITY.posCloseShift]: ["workspace.view", "orders.manage"],
  [CAPABILITY.productionRun]: ["workspace.view", "production.manage"],
  [CAPABILITY.packingVerify]: ["workspace.view", "packing.manage"],
  [CAPABILITY.routesAssign]: ["workspace.view", "routes.manage"],
  [CAPABILITY.inventoryRead]: ["workspace.view"],
  [CAPABILITY.inventoryWrite]: ["workspace.view", "production.manage"],
  [CAPABILITY.staffManage]: ["workspace.view", "staff.manage"],
  [CAPABILITY.billingManage]: ["workspace.view", "billing.manage"],
  [CAPABILITY.integrationsManage]: ["workspace.view", "integrations.manage"],
  [CAPABILITY.exportsSensitive]: ["workspace.view", "workspace.settings"],
  [CAPABILITY.impersonationRequest]: ["workspace.view"],
};

export function workspacePermissionsFromCapabilities(
  capabilities: readonly CapabilityKey[],
): Set<PermissionKey> {
  const out = new Set<PermissionKey>();
  for (const cap of capabilities) {
    for (const key of CAPABILITY_TO_WORKSPACE[cap] ?? []) out.add(key);
  }
  return out;
}
