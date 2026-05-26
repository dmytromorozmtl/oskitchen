import type { BillingScope } from "@/lib/billing/billing-scope";

/**
 * Organization billing is **not** fully automated in Stripe for multi-workspace tenants.
 * Use `BillingMode.ENTERPRISE_CONTRACT` / manual invoicing flows for enterprise deals.
 */
export function resolveBillingScopeForUser(_userId: string): BillingScope {
  return "WORKSPACE";
}
