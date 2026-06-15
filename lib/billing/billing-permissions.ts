import { hasPermission } from "@/lib/permissions/guards";
import type { PermissionKey } from "@/lib/permissions/permissions";

export type BillingActorScope = {
  role?: string | null;
  email?: string | null;
};

export type BillingCapability =
  | "billing.view"
  | "billing.view.diagnostics"
  | "billing.checkout"
  | "billing.portal.open"
  | "billing.cancel"
  | "billing.downgrade"
  | "billing.override.write"
  | "billing.mode.write"
  | "billing.audit.view";

const GRANTS: Record<BillingCapability, string[]> = {
  "billing.view": ["owner", "admin", "manager", "operations_lead", "accountant", "implementation_manager"],
  "billing.view.diagnostics": ["owner", "admin", "operations_lead", "implementation_manager"],
  "billing.checkout": ["owner", "admin"],
  "billing.portal.open": ["owner", "admin", "accountant"],
  "billing.cancel": ["owner", "admin"],
  "billing.downgrade": ["owner", "admin"],
  "billing.override.write": ["owner", "admin"],
  /** Platform superadmin only — enforced via `isSuperAdminBilling`; no workspace role grants. */
  "billing.mode.write": [],
  "billing.audit.view": ["owner", "admin", "operations_lead", "accountant", "implementation_manager"],
};

export const BILLING_CAPABILITY_TO_CANONICAL: Partial<Record<BillingCapability, PermissionKey>> = {
  "billing.view": "billing.view",
  "billing.view.diagnostics": "billing.manage",
  "billing.checkout": "billing.manage",
  "billing.portal.open": "billing.manage",
  "billing.cancel": "billing.manage",
  "billing.downgrade": "billing.manage",
  "billing.override.write": "billing.manage",
  "billing.audit.view": "billing.view",
};

export function billingCapabilityToPermissionKey(cap: BillingCapability): PermissionKey {
  return BILLING_CAPABILITY_TO_CANONICAL[cap] ?? "billing.manage";
}

function hasCanonicalBillingGrant(
  granted: ReadonlySet<PermissionKey>,
  cap: BillingCapability,
): boolean {
  const required = BILLING_CAPABILITY_TO_CANONICAL[cap];
  if (!required) return false;
  if (hasPermission(granted, required)) return true;
  if (required === "billing.view" && hasPermission(granted, "billing.manage")) return true;
  return false;
}

/** Assign plan / billing mode / INTERNAL_FREE — never workspace owner/admin. */
export function canAssignBillingMode(scope: BillingActorScope): boolean {
  return isSuperAdminBilling(scope);
}

export function isSuperAdminBilling(_scope: BillingActorScope): boolean {
  return false;
}

export function canUseBilling(
  scope: BillingActorScope,
  cap: BillingCapability,
  options?: { granted?: ReadonlySet<PermissionKey> },
): boolean {
  if (isSuperAdminBilling(scope)) return true;
  if (options?.granted && hasCanonicalBillingGrant(options.granted, cap)) {
    return true;
  }
  const role = (scope.role ?? "").toLowerCase();
  return GRANTS[cap]?.includes(role) ?? false;
}
