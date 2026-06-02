"use client";

import * as React from "react";
import Link from "next/link";

import { RoiCalculator } from "@/components/marketing/roi-calculator";
import { CompareFaqSection } from "@/components/marketing/compare-faq-section";
import { TcoCalculator } from "@/components/marketing/tco-calculator";
import { PRICING_FAQ_ITEMS } from "@/lib/marketing/pricing-faq";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";
import { A11Y_FOCUS_RING, A11Y_INLINE_LINK, A11Y_SEGMENT_BUTTON } from "@/lib/a11y/ui-classes";
import { cn } from "@/lib/utils";
import { PLAN_REGISTRY } from "@/lib/billing/plan-registry";

const ANNUAL_DISCOUNT_PCT = 17;

// Marketing copy uses the single plan registry as the price source of truth,
// keeping richer feature bullets here for storytelling. Prices must NOT be
// duplicated below — read them from the registry.
const PLANS = [
  {
    key: "STARTER" as const,
    name: PLAN_REGISTRY.STARTER.name,
    monthly: PLAN_REGISTRY.STARTER.priceMonthlyUsd ?? 0,
    desc: "Small weekly food businesses starting operations.",
    bullets: [
      "Manual orders",
      "Public preorder storefront (when enabled)",
      "1 active menu",
      "100 orders / month",
      "Basic production board",
      "Basic packing lists",
      "Email support",
    ],
    cta: "trial" as const,
  },
  {
    key: "PRO" as const,
    name: PLAN_REGISTRY.PRO.name,
    monthly: PLAN_REGISTRY.PRO.priceMonthlyUsd ?? 0,
    desc: "Growing meal prep, catering, and kitchen teams.",
    bullets: [
      "Everything in Starter",
      "WooCommerce & Shopify (setup-ready — requires your API credentials)",
      "1,000 orders / month",
      "Packing labels",
      "Customer CRM",
      "Analytics",
      "Inventory lite",
      "Recipe costing",
      "Priority support",
    ],
    cta: "trial" as const,
    featured: true,
  },
  {
    key: "TEAM" as const,
    name: PLAN_REGISTRY.TEAM.name,
    monthly: PLAN_REGISTRY.TEAM.priceMonthlyUsd ?? 0,
    desc: "Multi-channel food operations.",
    bullets: [
      "Everything in Pro",
      "Uber Eats architecture (partner credentials required)",
      "DoorDash & Grubhub adapters (BETA — credentials required)",
      "Staff roles",
      "Delivery routes",
      "Advanced production",
      "Forecasting",
      "Webhook ingestion log (operator replay only where audited actions exist)",
      "High-volume orders",
    ],
    cta: "trial" as const,
  },
  {
    key: "ENTERPRISE" as const,
    name: PLAN_REGISTRY.ENTERPRISE.name,
    monthly: PLAN_REGISTRY.ENTERPRISE.priceMonthlyUsd,
    desc: "Multi-location and custom operations.",
    bullets: [
      "Multi-location",
      "Custom integrations (scoped statements of work)",
      "API access where contracted",
      "Onboarding support",
      "SLA as agreed in contract",
      "Dedicated support",
    ],
    cta: "contact" as const,
  },
];

const FEATURE_ROWS: { label: string; s: boolean; p: boolean; t: boolean; e: boolean }[] = [
  { label: "Manual orders & storefront", s: true, p: true, t: true, e: true },
  { label: "WooCommerce / Shopify", s: false, p: true, t: true, e: true },
  { label: "DoorDash / Grubhub / Uber Eats adapters (BETA)", s: false, p: false, t: true, e: true },
  { label: "Analytics & CRM rollup", s: false, p: true, t: true, e: true },
  { label: "Forecasting & webhook ingestion log", s: false, p: false, t: true, e: true },
  { label: "Enterprise API keys", s: false, p: false, t: false, e: true },
];

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
            {APP_NAME} is the operating system for modern food operations — POS, orders, production, packing, delivery,
            customers, and integrations in one workspace. It does not replace Shopify, WooCommerce, or marketplaces;
            it coordinates the kitchen after orders are captured.
          </p>
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
          {PLANS.map((plan) => (
            <Card
              key={plan.key}
              className={`flex flex-col border-border/80 ${plan.featured ? "border-primary/40 shadow-lg shadow-primary/10" : ""}`}
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
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
                    <Link href="/signup">Start free trial</Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href="/book-demo">Talk to us</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-950 dark:text-amber-100">
          Marketplace adapters (Uber Eats, DoorDash, Grubhub) require partner approval and your
          credentials — we never imply official endorsement until your integration is verified live.
          Uber Direct courier dispatch is on the roadmap and is not included in any plan today.
        </div>

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
                {FEATURE_ROWS.map((row) => (
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
