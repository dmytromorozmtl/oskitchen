import { AdminAssignPlanForm } from "@/components/dashboard/billing/admin-form";
import { StripeDiagnosticsCard } from "@/components/dashboard/billing/diagnostics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireBillingPageAccess } from "@/lib/billing/billing-page-access";
import { requireUserProfile } from "@/lib/auth";
import { isSuperAdminUser } from "@/lib/platform-super-bypass";
import { BILLING_MODE_LABEL } from "@/lib/billing/billing-status";
import { planDef } from "@/lib/billing/plan-registry";
import { getStripeDiagnosticsResolved } from "@/lib/billing/stripe-config";
import { loadSubscription } from "@/services/billing/subscription-service";

export default async function BillingSettingsPage() {
  const access = await requireBillingPageAccess("billing.view.diagnostics");
  if (!access.ok) {
    return access.deny;
  }
  const { actor } = access;
  const profile = await requireUserProfile();
  const canAssignPlan = await isSuperAdminUser(actor.sessionUserId, profile.email ?? actor.email);

  const [sub, diag] = await Promise.all([
    loadSubscription(actor.userId),
    getStripeDiagnosticsResolved(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Billing settings</h1>
        <p className="text-sm text-muted-foreground">Diagnostics and admin tools for this workspace.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workspace billing state</CardTitle>
          <CardDescription>Current plan, mode, and Stripe identifiers.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm md:grid-cols-2">
          <p>Plan: <Badge variant="outline">{planDef(sub.plan).name}</Badge></p>
          <p>Mode: <Badge variant="outline">{BILLING_MODE_LABEL[sub.billingMode as keyof typeof BILLING_MODE_LABEL] ?? sub.billingMode}</Badge></p>
          <p>Status (db): <Badge variant="outline">{sub.status}</Badge></p>
          <p>Status (detail): <Badge variant="outline">{sub.statusDetail}</Badge></p>
          <p className="font-mono text-xs">Stripe customer: {sub.stripeCustomerId ?? "—"}</p>
          <p className="font-mono text-xs">Stripe subscription: {sub.stripeSubscriptionId ?? "—"}</p>
          <p className="font-mono text-xs">Stripe price: {sub.stripePriceId ?? "—"}</p>
          <p className="text-xs text-muted-foreground">cancelAtPeriodEnd: {sub.cancelAtPeriodEnd ? "true" : "false"}</p>
        </CardContent>
      </Card>

      <StripeDiagnosticsCard diagnostics={diag} />

      {canAssignPlan ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Admin: assign plan / mode</CardTitle>
            <CardDescription>
              Platform superadmin only. Use when Stripe is intentionally bypassed (internal,
              contract, dev). All changes are logged.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminAssignPlanForm />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
