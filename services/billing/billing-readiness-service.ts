import { isFunctionallyActive, trialDaysRemaining, type BillingStatusKey } from "@/lib/billing/billing-status";
import { getStripeConfigState } from "@/lib/billing/stripe-config";
import { loadSubscription } from "@/services/billing/subscription-service";

export type BillingReadinessSnapshot = {
  stripeConfigured: boolean;
  planActive: boolean;
  hasCustomer: boolean;
  mode: string;
  trialDaysRemaining: number | null;
};

export async function loadBillingReadinessSnapshot(userId: string): Promise<BillingReadinessSnapshot> {
  const sub = await loadSubscription(userId);
  const state = getStripeConfigState();
  const stripeConfigured = state === "configured";
  const planActive =
    isFunctionallyActive(sub.statusDetail as BillingStatusKey) ||
    sub.billingMode === "INTERNAL_FREE" ||
    sub.billingMode === "ENTERPRISE_CONTRACT";
  return {
    stripeConfigured,
    planActive,
    hasCustomer: Boolean(sub.stripeCustomerId),
    mode: sub.billingMode,
    trialDaysRemaining: trialDaysRemaining(sub.trialEnd),
  };
}
