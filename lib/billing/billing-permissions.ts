import { isSuperAdminEmail } from "@/lib/platform-owner";

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

/** Assign plan / billing mode / INTERNAL_FREE — never workspace owner/admin. */
export function canAssignBillingMode(scope: BillingActorScope): boolean {
  return isSuperAdminBilling(scope);
}

export function isSuperAdminBilling(scope: BillingActorScope): boolean {
  return isSuperAdminEmail(scope.email);
}

export function canUseBilling(scope: BillingActorScope, cap: BillingCapability): boolean {
  if (isSuperAdminBilling(scope)) return true;
  const role = (scope.role ?? "").toLowerCase();
  return GRANTS[cap]?.includes(role) ?? false;
}
