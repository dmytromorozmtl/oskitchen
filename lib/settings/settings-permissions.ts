import type { SettingsCapability } from "./section-registry";

export type SettingsActorScope = {
  userId: string;
  email: string | null;
  role: string | null;
  platformBypass?: boolean;
};

function normalizeRole(role: string | null | undefined): string {
  return (role ?? "").toLowerCase();
}

const ROLE_GRANTS: Record<string, SettingsCapability[]> = {
  owner: [
    "view_settings",
    "manage_workspace",
    "manage_operations",
    "manage_orders",
    "manage_production",
    "manage_packing",
    "manage_delivery",
    "manage_routes",
    "manage_crm",
    "manage_storefront",
    "manage_branding",
    "manage_domains",
    "manage_notifications",
    "manage_integrations",
    "manage_billing",
    "manage_staff",
    "manage_security",
    "manage_automation",
    "manage_ai",
    "manage_imports",
    "manage_compliance",
    "manage_developer",
    "manage_advanced",
  ],
  admin: [
    "view_settings",
    "manage_workspace",
    "manage_operations",
    "manage_orders",
    "manage_production",
    "manage_packing",
    "manage_delivery",
    "manage_routes",
    "manage_crm",
    "manage_storefront",
    "manage_branding",
    "manage_domains",
    "manage_notifications",
    "manage_integrations",
    "manage_billing",
    "manage_staff",
    "manage_security",
    "manage_automation",
    "manage_ai",
    "manage_imports",
    "manage_compliance",
    "manage_developer",
  ],
  manager: [
    "view_settings",
    "manage_operations",
    "manage_orders",
    "manage_production",
    "manage_packing",
    "manage_delivery",
    "manage_routes",
    "manage_crm",
    "manage_storefront",
    "manage_notifications",
    "manage_automation",
  ],
  staff: ["view_settings"],
};

export function isSuperAdminSettings(actor: SettingsActorScope): boolean {
  return Boolean(actor.platformBypass);
}

export function canUseSettings(actor: SettingsActorScope, cap: SettingsCapability): boolean {
  if (isSuperAdminSettings(actor)) return true;
  const role = normalizeRole(actor.role);
  return (ROLE_GRANTS[role] ?? []).includes(cap);
}

/** Resolve all caps granted to an actor — used for sidebar filtering. */
export function settingsCapabilitiesFor(actor: SettingsActorScope): Set<SettingsCapability> {
  if (isSuperAdminSettings(actor)) {
    return new Set<SettingsCapability>(ROLE_GRANTS.owner);
  }
  const role = normalizeRole(actor.role);
  return new Set<SettingsCapability>(ROLE_GRANTS[role] ?? ["view_settings"]);
}
