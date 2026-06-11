import { PortalButton } from "@/components/dashboard/billing/checkout-buttons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireBillingPageAccess } from "@/lib/billing/billing-page-access";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getStripeConfigState } from "@/lib/billing/stripe-config";
import { loadSubscription } from "@/services/billing/subscription-service";

export default async function PaymentMethodPage() {
  const access = await requireBillingPageAccess("billing.portal.open");
  if (!access.ok) {
    return access.deny;
  }
  const { dataUserId } = await getTenantActor();
  const sub = await loadSubscription(dataUserId);
  const state = getStripeConfigState();
  const portalEnabled = state === "configured" && Boolean(sub.stripeCustomerId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payment method</h1>
        <p className="text-sm text-muted-foreground">
          Card data is stored by Stripe. We never handle raw card numbers; the Stripe customer
          portal is the source of truth.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Manage payment method</CardTitle>
          <CardDescription>
            {portalEnabled
              ? "Open the Stripe portal to add, update, or remove cards and download invoices."
              : sub.stripeCustomerId
                ? "Stripe is not fully configured in this environment."
                : "No Stripe customer on file yet — run through checkout once to create one."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <PortalButton disabled={!portalEnabled} />
          <ul className="list-inside list-disc text-xs text-muted-foreground">
            <li>OS Kitchen never displays card numbers.</li>
            <li>All card edits happen on Stripe-hosted pages.</li>
            <li>Refunds and disputes are handled in the Stripe Dashboard.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
