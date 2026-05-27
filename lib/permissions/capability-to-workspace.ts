import { CAPABILITY, type CapabilityKey } from "@/lib/permissions/permission-matrix";
import type { PermissionKey } from "@/lib/permissions/permissions";

/** Map declarative capabilities → workspace permission keys (RBAC Phase D). */
export const CAPABILITY_TO_WORKSPACE: Record<CapabilityKey, readonly PermissionKey[]> = {
  [CAPABILITY.ordersRead]: ["workspace.view"],
  [CAPABILITY.ordersWrite]: ["workspace.view", "orders.manage"],
  [CAPABILITY.ordersCancel]: ["workspace.view", "orders.manage"],
  [CAPABILITY.posOperate]: ["workspace.view", "orders.manage", "pos.access", "pos.checkout"],
  [CAPABILITY.posCloseShift]: ["workspace.view", "pos.shift.open", "pos.shift.close"],
  [CAPABILITY.posManage]: [
    "workspace.view",
    "pos.discount.apply",
    "pos.refund",
    "pos.void",
    "pos.register.manage",
    "pos.hardware.manage",
    "pos.manager.override",
  ],
  [CAPABILITY.productionRun]: ["workspace.view", "production.manage"],
  [CAPABILITY.kitchenView]: ["workspace.view", "kitchen.view"],
  [CAPABILITY.kitchenBump]: ["workspace.view", "kitchen.view", "kitchen.bump"],
  [CAPABILITY.kitchenRecall]: ["workspace.view", "kitchen.view", "kitchen.recall"],
  [CAPABILITY.kitchenConfigure]: ["workspace.view", "kitchen.view", "kitchen.configure"],
  [CAPABILITY.kitchenExpoManage]: [
    "workspace.view",
    "kitchen.view",
    "kitchen.expo.manage",
  ],
  [CAPABILITY.packingVerify]: ["workspace.view", "packing.manage"],
  [CAPABILITY.routesAssign]: ["workspace.view", "routes.manage"],
  [CAPABILITY.inventoryRead]: ["workspace.view"],
  [CAPABILITY.inventoryWrite]: ["workspace.view", "production.manage"],
  [CAPABILITY.staffManage]: [
    "workspace.view",
    "staff.manage",
    "schedule.manage",
    "timeclock.manage",
  ],
  [CAPABILITY.billingManage]: ["workspace.view", "billing.view", "billing.manage"],
  [CAPABILITY.integrationsRead]: ["workspace.view", "integrations.read"],
  [CAPABILITY.integrationsManage]: [
    "workspace.view",
    "integrations.read",
    "integrations.manage",
  ],
  [CAPABILITY.storefrontPublish]: [
    "workspace.view",
    "storefront.read",
    "storefront.manage",
    "storefront.publish",
  ],
  [CAPABILITY.storefrontMedia]: [
    "workspace.view",
    "storefront.read",
    "storefront.media.manage",
  ],
  [CAPABILITY.storefrontManage]: [
    "workspace.view",
    "storefront.read",
    "storefront.manage",
  ],
  [CAPABILITY.reportsReadOperations]: ["workspace.view", "reports.read.operations"],
  [CAPABILITY.reportsReadFinancial]: ["workspace.view", "reports.read.financial"],
  [CAPABILITY.reportsReadCustomerPii]: ["workspace.view", "reports.read.customer_pii"],
  [CAPABILITY.reportsReadAudit]: ["workspace.view", "reports.read.audit"],
  [CAPABILITY.reportsSavedManage]: ["workspace.view", "reports.saved.manage"],
  [CAPABILITY.exportsSensitive]: [
    "workspace.view",
    "orders.export",
    "customers.export",
    "reports.export",
  ],
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
