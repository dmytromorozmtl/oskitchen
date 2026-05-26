import type { PermissionKey as LegacyPermissionKey } from "@/lib/permissions/legacy";
import type { PermissionKey as WorkspacePermissionKey } from "@/lib/permissions/permissions";

/** Map legacy dashboard keys to workspace keys for hybrid UI gates. */
export const LEGACY_TO_WORKSPACE: Partial<Record<LegacyPermissionKey, WorkspacePermissionKey>> = {
  manage_orders: "orders.manage",
  manage_production: "production.manage",
  manage_packing: "packing.manage",
  manage_integrations: "integrations.manage",
  manage_settings: "workspace.settings",
  manage_billing: "billing.manage",
  manage_team: "staff.manage",
  manage_customers: "customers.manage",
  pos_access: "orders.manage",
  pos_comp: "orders.manage",
};
