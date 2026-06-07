"use client";

import * as React from "react";
import Link from "next/link";

import { RoiCalculator } from "@/components/marketing/roi-calculator";
import { CompareFaqSection } from "@/components/marketing/compare-faq-section";
import { CommissionComparisonCalculator } from "@/components/marketing/commission-comparison-calculator";
import { PricingCompetitorBenchmark } from "@/components/marketing/pricing-competitor-benchmark";
import { TcoCalculator } from "@/components/marketing/tco-calculator";
import { PRICING_FAQ_ITEMS } from "@/lib/marketing/pricing-faq";
import {
  PUBLIC_PRICING_COMPARE_ROWS,
  PUBLIC_PRICING_PLANS,
  PUBLIC_PRICING_UNIVERSAL_BENEFITS,
  signupHrefForPlan,
} from "@/lib/marketing/public-pricing-content";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { A11Y_INLINE_LINK, A11Y_SEGMENT_BUTTON } from "@/lib/a11y/ui-classes";
import { cn } from "@/lib/utils";
import {
  VENDOR_PLAN_MONTHLY_FEE_USD,
  VENDOR_PLAN_ORDER,
  commissionRateForPlan,
} from "@/lib/marketplace/billing-integration-types";
import type { VendorPlanTier } from "@prisma/client";

const ANNUAL_DISCOUNT_PCT = 17;

const VENDOR_PLAN_LABELS: Record<VendorPlanTier, string> = {
  FREE: "Free",
  GROWTH: "Growth",
  ENTERPRISE: "Enterprise",
};

const VENDOR_PLAN_DESCRIPTIONS: Record<VendorPlanTier, string> = {
  FREE: "Pilot suppliers and long-tail catalogs",
  GROWTH: "Active regional distributors",
  ENTERPRISE: "Multi-category and national suppliers",
};

export function PricingPage() {
  const [annual, setAnnual] = React.useState(false);

  function displayPrice(monthly: number) {
    if (!annual) return monthly;
    const rounded = Math.round(monthly * (1 - ANNUAL_DISCOUNT_PCT / 100));
    return rounded;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Transparent pricing
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Plans that match real kitchens
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Four transparent plans — self-serve signup with a 14-day trial. POS, kitchen display, orders,
            production, and integrations in one workspace. No proprietary hardware required.
          </p>
          <ul
            data-testid="pricing-universal-benefits"
            className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
          >
            {PUBLIC_PRICING_UNIVERSAL_BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-center gap-1.5">
                <span aria-hidden className="text-primary">
                  ✓
                </span>
                {benefit}
              </li>
            ))}
          </ul>
          <div
            role="group"
            aria-label="Billing period"
            className="mt-8 inline-flex rounded-full border border-border bg-muted/30 p-1 text-sm"
          >
            <button
              type="button"
              aria-pressed={!annual}
              className={cn(
                A11Y_SEGMENT_BUTTON,
                !annual ? "bg-background shadow-sm" : "text-muted-foreground",
              )}
              onClick={() => setAnnual(false)}
            >
              Monthly
            </button>
            <button
              type="button"
              aria-pressed={annual}
              className={cn(
                A11Y_SEGMENT_BUTTON,
                annual ? "bg-background shadow-sm" : "text-muted-foreground",
              )}
              onClick={() => setAnnual(true)}
            >
              Annual (save ~{ANNUAL_DISCOUNT_PCT}%)
            </button>
          </div>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-4">
          {PUBLIC_PRICING_PLANS.map((plan) => (
            <Card
              key={plan.key}
              data-testid={`pricing-plan-${plan.key.toLowerCase()}`}
              className={`flex flex-col border-border/80 ${plan.featured ? "border-primary/40 shadow-lg shadow-primary/10" : ""}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.badge ? (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                      {plan.badge}
                    </span>
                  ) : null}
                </div>
                <CardDescription>{plan.desc}</CardDescription>
                {plan.monthly != null ? (
                  <p className="pt-2 text-3xl font-semibold">
                    ${displayPrice(plan.monthly)}
                    <span className="text-base font-normal text-muted-foreground">
                      {" "}
                      / mo {annual ? "(effective)" : ""}
                    </span>
                  </p>
                ) : (
                  <p className="pt-2 text-2xl font-semibold">Contact sales</p>
                )}
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <ul className="flex-1 space-y-2 text-sm text-muted-foreground">
                  {plan.bullets.map((b) => (
                    <li key={b}>• {b}</li>
                  ))}
                </ul>
                {plan.cta === "trial" ? (
                  <Button asChild className="rounded-full" variant={plan.featured ? "default" : "outline"}>
                    <Link href={signupHrefForPlan(plan.key)} data-testid={`pricing-cta-${plan.key.toLowerCase()}`}>
                      Start free trial
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href="/book-demo" data-testid="pricing-cta-enterprise">
                      Contact sales
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-950 dark:text-amber-100">
          Delivery marketplace adapters (Uber Eats, DoorDash, Grubhub) require partner approval and your
          credentials — we never imply official endorsement until your integration is verified live.
          Uber Direct courier dispatch is on the roadmap and is not included in any plan today.
        </div>

        <PricingCompetitorBenchmark />

        <section className="mt-20" aria-labelledby="marketplace-pricing-heading">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              HoReCa B2B marketplace
            </p>
            <h2 id="marketplace-pricing-heading" className="mt-3 text-2xl font-semibold tracking-tight">
              Supply ordering for restaurants — vendor-side fees only
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
              Browse approved vendor catalogs, build carts, and create purchase orders inside your OS Kitchen
              workspace. Restaurant plans above include marketplace access —{" "}
              <strong className="font-medium text-foreground">no separate buyer marketplace fee</strong>. You pay
              vendor list price plus Stripe processing at checkout.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Card className="border-border/80">
              <CardHeader>
                <CardTitle className="text-lg">For restaurant buyers</CardTitle>
                <CardDescription>Included with Starter, Pro, Team, and Enterprise</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Catalog browse, filters, and PO workflow in your workspace</p>
                <p>• No OS Kitchen commission added to your invoice — vendors pay platform fees</p>
                <p>• Approval gates and cross-vendor carts as features roll out (BETA)</p>
                <p className="pt-2 text-xs text-amber-950 dark:text-amber-100">
                  Marketplace is <strong className="font-medium">BETA</strong> — design-partner vendors onboarding on
                  staging; not a live national supplier network yet.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/80">
              <CardHeader>
                <CardTitle className="text-lg">For suppliers & distributors</CardTitle>
                <CardDescription>Separate vendor plans — Stripe Connect payouts when enabled</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Monthly SaaS tier + commission on completed marketplace orders</li>
                  <li>• Optional featured placement slots (Growth+)</li>
                  <li>• Express onboarding at /vendor/register after platform approval</li>
                </ul>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/vendor">Become a marketplace vendor</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-10 overflow-x-auto rounded-2xl border border-border/80">
            <table className="w-full min-w-[520px] text-sm" aria-label="Marketplace vendor plan pricing">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Vendor tier</th>
                  <th className="px-4 py-3 text-left font-medium">Monthly fee</th>
                  <th className="px-4 py-3 text-left font-medium">Commission on GMV</th>
                  <th className="px-4 py-3 text-left font-medium">Best for</th>
                </tr>
              </thead>
              <tbody>
                {VENDOR_PLAN_ORDER.map((tier) => (
                  <tr key={tier} className="border-t border-border/60">
                    <td className="px-4 py-3 font-medium">{VENDOR_PLAN_LABELS[tier]}</td>
                    <td className="px-4 py-3">
                      {VENDOR_PLAN_MONTHLY_FEE_USD[tier] === 0
                        ? "$0"
                        : `$${VENDOR_PLAN_MONTHLY_FEE_USD[tier]}`}
                      /mo
                    </td>
                    <td className="px-4 py-3">{commissionRateForPlan(tier)}%</td>
                    <td className="px-4 py-3 text-muted-foreground">{VENDOR_PLAN_DESCRIPTIONS[tier]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Featured placement slots (homepage hero, catalog top, category spotlight) available to Growth+ vendors
            — see vendor cabinet after approval. Illustrative economics only; no live GMV on record as of June 2026.
          </p>
        </section>

        <section className="mt-20">
          <h2 className="text-center text-2xl font-semibold">Feature comparison</h2>
          <div className="mt-8 overflow-x-auto rounded-2xl border border-border/80">
            <table className="w-full min-w-[640px] text-sm" aria-label="Plan feature comparison">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Capability</th>
                  <th className="px-4 py-3">Starter</th>
                  <th className="px-4 py-3">Pro</th>
                  <th className="px-4 py-3">Team</th>
                  <th className="px-4 py-3">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {PUBLIC_PRICING_COMPARE_ROWS.map((row) => (
                  <tr key={row.label} className="border-t border-border/60">
                    <td className="px-4 py-3">{row.label}</td>
                    <td className="px-4 py-3 text-center">{row.s ? "✓" : "—"}</td>
                    <td className="px-4 py-3 text-center">{row.p ? "✓" : "—"}</td>
                    <td className="px-4 py-3 text-center">{row.t ? "✓" : "—"}</td>
                    <td className="px-4 py-3 text-center">{row.e ? "✓" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-16 rounded-2xl border border-border/80 bg-muted/20 p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Delivery economics</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
            Marketplace commission vs own channel
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Directional benchmark calculator — same rates as the delivery-commissions dashboard. Not a
            settlement guarantee.
          </p>
          <div className="mt-8">
            <CommissionComparisonCalculator compact />
          </div>
        </section>

        <section className="mt-16 rounded-2xl border border-border/80 bg-muted/20 p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Total cost of ownership</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">Hardware POS vs cloud — 5-year model</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Compare terminal bundles to OS Kitchen on tablets you already own. Processing fees excluded.
          </p>
          <div className="mt-8">
            <TcoCalculator />
          </div>
        </section>

        <section className="mt-16 rounded-2xl border bg-muted/20 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">Operational ROI estimate</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Conservative estimate only. Use it to frame a demo, not as a guaranteed savings claim.
          </p>
          <div className="mt-6">
            <RoiCalculator />
          </div>
        </section>

        <CompareFaqSection
          faqs={PRICING_FAQ_ITEMS.map((item) => ({ q: item.question, a: item.answer }))}
          tag="Pricing FAQ"
          title="Questions finance and ops ask"
        />
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Integration details:{' '}
          <Link href="/integrations" className={A11Y_INLINE_LINK}>
            capability matrix
          </Link>
          {' · '}
          <Link href="/get-started" className={A11Y_INLINE_LINK}>
            choose your path
          </Link>
        </p>
      </main>
  );
}
