import { PlanCards } from "@/components/dashboard/billing/plan-cards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireBillingPageAccess } from "@/lib/billing/billing-page-access";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { FEATURE_FLAGS, FEATURE_LABEL } from "@/lib/billing/entitlements";
import { PLAN_KEYS, planDef } from "@/lib/billing/plan-registry";
import {
  getStripeCheckoutBlockReason,
  isStripeCheckoutReady,
} from "@/lib/billing/stripe-config";
import { loadSubscription } from "@/services/billing/subscription-service";

export default async function PlansPage() {
  const access = await requireBillingPageAccess("billing.view");
  if (!access.ok) {
    return access.deny;
  }
  const { dataUserId } = await getTenantActor();
  const sub = await loadSubscription(dataUserId);
  const checkoutReady = isStripeCheckoutReady();
  const checkoutDisabled = !checkoutReady;
  const reason = checkoutDisabled
    ? (getStripeCheckoutBlockReason() ?? "Checkout disabled until Stripe is configured.")
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Plans</h1>
        <p className="text-sm text-muted-foreground">
          Plans, limits, and features come from a single registry. The Enterprise plan is
          contract-only.
        </p>
      </div>

      <PlanCards
        currentPlan={sub.plan}
        checkoutDisabled={checkoutDisabled || !access.canCheckout}
        reason={
          !access.canCheckout
            ? "You do not have permission to start checkout for this workspace."
            : reason
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Feature comparison</CardTitle>
          <CardDescription>Default plan entitlements before any overrides.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-3">Feature</th>
                  {PLAN_KEYS.map((k) => (
                    <th key={k} className="py-2 pr-3">{planDef(k).name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_FLAGS.map((flag) => (
                  <tr key={flag} className="border-b">
                    <td className="py-2 pr-3 font-medium">{FEATURE_LABEL[flag]}</td>
                    {PLAN_KEYS.map((k) => {
                      const has = planDef(k).features[flag];
                      return (
                        <td key={k} className={`py-2 pr-3 ${has ? "text-emerald-700" : "text-muted-foreground"}`}>
                          {has ? "✓" : "—"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
