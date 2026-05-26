import type { PermissionKey } from "@/lib/permissions/permissions";
import type { SettingsCapability } from "./section-registry";

/** Phase B: map settings-center capabilities to workspace permission keys. */
export const SETTINGS_CAPABILITY_PERMISSION: Partial<Record<SettingsCapability, PermissionKey>> = {
  view_settings: "workspace.view",
  manage_workspace: "workspace.settings",
  manage_operations: "workspace.settings",
  manage_orders: "orders.manage",
  manage_production: "production.manage",
  manage_packing: "packing.manage",
  manage_delivery: "routes.manage",
  manage_routes: "routes.manage",
  manage_crm: "customers.manage",
  manage_storefront: "workspace.settings",
  manage_branding: "workspace.settings",
  manage_domains: "workspace.settings",
  manage_notifications: "workspace.settings",
  manage_integrations: "integrations.manage",
  manage_billing: "billing.manage",
  manage_staff: "staff.manage",
  manage_security: "workspace.settings",
  manage_automation: "workspace.settings",
  manage_ai: "workspace.settings",
  manage_imports: "workspace.settings",
  manage_compliance: "workspace.settings",
  manage_developer: "workspace.settings",
  manage_advanced: "workspace.settings",
};
