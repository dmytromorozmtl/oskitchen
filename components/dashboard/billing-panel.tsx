"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STRIPE_PLANS } from "@/lib/constants";

type Props = {
  plan: string;
  status: string;
  stripeConfigured: boolean;
  stripeTestMode: boolean;
  limits: {
    menus: string;
    orders: string;
    integrations: string;
  };
  customerReady: boolean;
};

export function BillingPanel({
  plan,
  status,
  stripeConfigured,
  stripeTestMode,
  limits,
  customerReady,
}: Props) {
  const [pending, setPending] = React.useState<string | null>(null);

  async function checkout(planKey: "STARTER" | "PRO" | "TEAM") {
    if (!stripeConfigured) {
      toast.error("Stripe is not configured for this environment.");
      return;
    }
    try {
      setPending(planKey);
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unable to start checkout");
      window.location.href = data.url as string;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Checkout failed";
      toast.error(message);
    } finally {
      setPending(null);
    }
  }

  async function portal() {
    if (!stripeConfigured) {
      toast.error("Stripe is not configured for this environment.");
      return;
    }
    try {
      setPending("portal");
      const res = await fetch("/api/billing-portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Portal unavailable");
      window.location.href = data.url as string;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Portal failed";
      toast.error(message);
    } finally {
      setPending(null);
    }
  }

  const checkoutPlans = ["STARTER", "PRO", "TEAM"] as const;
  const tiers = checkoutPlans.map((key) => ({
    key,
    ...STRIPE_PLANS[key],
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Billing</h1>
        <p className="mt-2 text-muted-foreground">
          Stripe Checkout for subscriptions — portal for payment methods and
          invoices.
        </p>
      </div>

      {!stripeConfigured ? (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-base">Stripe setup required</CardTitle>
            <p className="text-sm text-muted-foreground">
              Add{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                STRIPE_SECRET_KEY
              </code>{" "}
              and{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                NEXT_PUBLIC_STRIPE_*_PRICE_ID
              </code>{" "}
              for Starter, Pro, and Team. Checkout stays disabled until configured — local
              development remains safe.
            </p>
          </CardHeader>
        </Card>
      ) : stripeTestMode ? (
        <Card className="border-sky-500/40 bg-sky-500/5">
          <CardHeader>
            <CardTitle className="text-base">Test mode</CardTitle>
            <p className="text-sm text-muted-foreground">
              Using Stripe test keys — no real charges. Switch to live keys only after{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">docs/STRIPE_LIVE_MODE_SETUP.md</code>{" "}
              checklist.
            </p>
          </CardHeader>
        </Card>
      ) : null}

      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Current plan</CardTitle>
            <p className="text-sm text-muted-foreground">
              Usage limits enforce automatically based on subscription status.
            </p>
          </div>
          <Badge variant="secondary">
            {plan} · {status}
          </Badge>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span>
            Menus: <strong className="text-foreground">{limits.menus}</strong>
          </span>
          <span>
            Orders / month:{" "}
            <strong className="text-foreground">{limits.orders}</strong>
          </span>
          <span>
            Integrations:{" "}
            <strong className="text-foreground">{limits.integrations}</strong>
          </span>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto rounded-full"
            disabled={!stripeConfigured || !customerReady || pending === "portal"}
            onClick={() => void portal()}
          >
            {pending === "portal" ? "Opening..." : "Customer portal"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {tiers.map((tier) => (
          <Card key={tier.key} className="border-border/80 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle>{tier.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{tier.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-3xl font-semibold">${tier.priceMonthly}</p>
              <Button
                className="w-full rounded-full"
                variant={tier.key === "PRO" ? "premium" : "outline"}
                disabled={!stripeConfigured || pending !== null}
                onClick={() => void checkout(tier.key)}
              >
                {pending === tier.key ? "Redirecting..." : "Choose plan"}
              </Button>
            </CardContent>
          </Card>
        ))}
        <Card className="border-border/80 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle>{STRIPE_PLANS.ENTERPRISE.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {STRIPE_PLANS.ENTERPRISE.description}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-3xl font-semibold">Custom</p>
            <Button className="w-full rounded-full" variant="outline" asChild>
              <a href="mailto:sales@kitchenos.app?subject=KitchenOS%20Enterprise">
                Contact sales
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <p className="text-sm text-muted-foreground">
        Need to leave?{" "}
        <Link href="/dashboard/billing/cancel" className="text-primary underline">
          Cancel or downgrade guidance
        </Link>{" "}
        — compare plans anytime on{" "}
        <Link href="/pricing" className="text-primary underline">
          /pricing
        </Link>
        .
      </p>
    </div>
  );
}
