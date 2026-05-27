import Link from "next/link";

import { PortalButton } from "@/components/dashboard/billing/checkout-buttons";
import { BillingStatusBadge, StripeConfigBadge } from "@/components/dashboard/billing/status-badge";
import { StripeDiagnosticsCard } from "@/components/dashboard/billing/diagnostics";
import { UsageBars } from "@/components/dashboard/billing/usage-bars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireBillingPageAccess } from "@/lib/billing/billing-page-access";
import { getTenantActor } from "@/lib/scope/cached-tenant";

import { requireUserProfile } from "@/lib/auth";
import { BILLING_MODE_LABEL } from "@/lib/billing/billing-status";
import { getBillingAccess } from "@/lib/billing/access";
import { trialDaysRemaining } from "@/lib/billing/billing-status";
import { planDef } from "@/lib/billing/plan-registry";
import { getStripeConfigStateResolved, getStripeDiagnosticsResolved } from "@/lib/billing/stripe-config";
import { loadSubscription } from "@/services/billing/subscription-service";
import { usageBarsForUser } from "@/services/billing/usage-service";

function fmtDate(d: Date | null) {
  if (!d) return "—";
  return d.toISOString().slice(0, 10);
}

export default async function BillingPage() {
  const access = await requireBillingPageAccess("billing.view");
  if (!access.ok) {
    return access.deny;
  }
  const { userId } = await getTenantActor();
  const profile = await requireUserProfile();
  const [sub, billingAccess] = await Promise.all([
    loadSubscription(userId),
    getBillingAccess(userId),
  ]);
  const plan = planDef(sub.plan);
  const diagnostics = await getStripeDiagnosticsResolved();
  const state = await getStripeConfigStateResolved();
  const usage = await usageBarsForUser(userId, sub.plan);

  const trialEnd = billingAccess.trialEndsAt ?? sub.trialEnd;
  const trialDays =
    billingAccess.trialDaysRemaining ?? trialDaysRemaining(trialEnd);
  const portalEnabled = state === "configured" && Boolean(sub.stripeCustomerId);
  const isSuper = access.actor.platformBypass;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Billing</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Manage subscription, plan limits, invoices, payment methods, usage, and billing status.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StripeConfigBadge state={state} />
          {access.canOpenPortal ? <PortalButton disabled={!portalEnabled} /> : null}
          {access.canCheckout ? (
            <Button asChild variant="outline">
              <Link href="/dashboard/billing/plans">Upgrade plan</Link>
            </Button>
          ) : null}
          {isSuper ? <Badge variant="outline">Superadmin</Badge> : null}
        </div>
      </div>

      {state === "missing" ? (
        <Card className="border-amber-300 bg-amber-50/40">
          <CardHeader>
            <CardTitle className="text-base text-amber-900">Stripe setup required</CardTitle>
            <CardDescription className="text-amber-900/80">
              Billing checkout is disabled until Stripe secret, webhook secret, and price IDs are
              configured. Local development remains safe.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Current plan</CardDescription>
            <CardTitle className="text-2xl">{plan.name}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {plan.priceMonthlyUsd === null ? "Custom pricing" : `$${plan.priceMonthlyUsd}/mo`}
            </p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Status</CardDescription>
            <CardTitle><BillingStatusBadge status={sub.statusDetail} /></CardTitle>
            <p className="text-xs text-muted-foreground">Mode: {BILLING_MODE_LABEL[sub.billingMode as keyof typeof BILLING_MODE_LABEL] ?? sub.billingMode}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Trial days remaining</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{trialDays ?? "—"}</CardTitle>
            <p className="text-xs text-muted-foreground">Trial ends {fmtDate(trialEnd)}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Next billing date</CardDescription>
            <CardTitle className="text-2xl">{fmtDate(sub.currentPeriodEnd)}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {sub.cancelAtPeriodEnd ? "Subscription will cancel at period end" : sub.stripeSubscriptionId ? "Active Stripe subscription" : "No Stripe subscription yet"}
            </p>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <UsageBars bars={usage} />
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plan features</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-xs text-muted-foreground">
            <p>Modules: {plan.visibleModules.join(", ")}</p>
            <p>Integrations: {plan.allowedIntegrations.join(", ") || "—"}</p>
            <p>Support: {plan.supportLevel}</p>
          </CardContent>
        </Card>
      </div>

      {access.canViewDiagnostics ? <StripeDiagnosticsCard diagnostics={diagnostics} /> : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configuration</CardTitle>
          <CardDescription>Quick links for the Billing & Subscription Center.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2 text-sm">
          <Button asChild size="sm" variant="outline"><Link href="/dashboard/billing/plans">Compare plans</Link></Button>
          <Button asChild size="sm" variant="outline"><Link href="/dashboard/billing/usage">Usage detail</Link></Button>
          <Button asChild size="sm" variant="outline"><Link href="/dashboard/billing/invoices">Invoices</Link></Button>
          {access.canOpenPortal ? (
            <Button asChild size="sm" variant="outline"><Link href="/dashboard/billing/payment-method">Payment method</Link></Button>
          ) : null}
          <Button asChild size="sm" variant="outline"><Link href="/dashboard/billing/entitlements">Entitlements</Link></Button>
          <Button asChild size="sm" variant="outline"><Link href="/dashboard/billing/history">Subscription history</Link></Button>
          {access.canCancel ? (
            <Button asChild size="sm" variant="outline"><Link href="/dashboard/billing/cancel">Cancel / downgrade</Link></Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
