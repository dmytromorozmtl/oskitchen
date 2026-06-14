/**
 * Transparent pilot pricing SKUs — sales-facing source of truth for /pricing.
 * In-product Stripe checkout applies to self-serve trial tiers only; pilot SKUs
 * are invoiced or contracted per era20-first-paid-pilot-package.
 */

import { PLAN_REGISTRY } from "@/lib/billing/plan-registry";

export const PILOT_DURATION_MONTHS = 3;
export const PILOT_DISCOUNT_PCT = 50;

/** P0-8 — public Design Partner Program term on /pricing (LOI-DP-001). */
export const DESIGN_PARTNER_PROGRAM_DURATION_DAYS = 90 as const;

export const DESIGN_PARTNER_PROGRAM_NAME = "Design Partner Program" as const;

export const DESIGN_PARTNER_PROGRAM_HEADLINE =
  "Design Partner Program — free for 90 days" as const;

export type PilotPricingSku = {
  sku: string;
  name: string;
  /** Published list price (monthly) when applicable */
  listMonthlyUsd: number | null;
  /** Pilot price (monthly) when applicable */
  pilotMonthlyUsd: number | null;
  /** One-time or range label for non-subscription line items */
  oneTimeLabel: string | null;
  duration: string;
  checkout: "self_serve_trial" | "loi" | "invoice";
  includes: string[];
  ctaLabel: string;
  ctaHref: string;
};

function pilotPrice(listMonthly: number): number {
  return Math.round(listMonthly * (1 - PILOT_DISCOUNT_PCT / 100));
}

/** Design partner LOI — non-binding engagement before paid pilot SOW */
export const DESIGN_PARTNER_LOI_SKU: PilotPricingSku = {
  sku: "LOI-DP-001",
  name: DESIGN_PARTNER_PROGRAM_NAME,
  listMonthlyUsd: null,
  pilotMonthlyUsd: 0,
  oneTimeLabel: "Free for 90 days",
  duration: `${DESIGN_PARTNER_PROGRAM_DURATION_DAYS} days`,
  checkout: "loi",
  includes: [
    "Dedicated staging workspace",
    "Weekly 30–45 min product feedback sync",
    "Launch wizard + Integration Health onboarding",
    "Influence on roadmap for in-scope modules (BETA / pilot_ready)",
    "Non-binding — paid pilot SOW optional at term end",
  ],
  ctaLabel: "Apply to Design Partner Program",
  ctaHref: "/book-demo",
};

/** 50% off list subscription during qualified pilot window */
export const PILOT_SUBSCRIPTION_SKUS: PilotPricingSku[] = (
  ["STARTER", "PRO", "TEAM"] as const
).map((key) => {
  const plan = PLAN_REGISTRY[key];
  const list = plan.priceMonthlyUsd ?? 0;
  return {
    sku: `PILOT-${key.slice(0, 3)}-50`,
    name: `Pilot ${plan.name}`,
    listMonthlyUsd: list,
    pilotMonthlyUsd: pilotPrice(list),
    oneTimeLabel: null,
    duration: `${PILOT_DURATION_MONTHS} months at 50% off`,
    checkout: "invoice",
    includes: [
      `All ${plan.name} plan modules at current maturity`,
      "White-glove menu + storefront setup (Week 1)",
      "Weekly 30-min ops check-in",
      "Priority defect queue during pilot term",
      "Case study permission (anonymized or named)",
    ],
    ctaLabel: "Talk to sales about pilot pricing",
    ctaHref: "/book-demo",
  };
});

/** Era 20 paid pilot platform fee — scoped SOW after LOI or direct ICP-qualified sale */
export const PAID_PILOT_PLATFORM_SKU: PilotPricingSku = {
  sku: "PILOT-PLAT-90",
  name: "Paid Pilot Platform (90-day SOW)",
  listMonthlyUsd: null,
  pilotMonthlyUsd: null,
  oneTimeLabel: "$500–2,500 / mo",
  duration: "90 days",
  checkout: "invoice",
  includes: [
    "Order hub, storefront, in-browser POS, KDS, production, packing",
    "Owner Daily Briefing + Launch Wizard + Integration Health",
    "One Woo or Shopify test shop (post live smoke PASS)",
    "Qualified beta scope only — see feature maturity matrix",
    "Conversion to standard tier at day 90 when KPI baseline met",
  ],
  ctaLabel: "Review pilot SOW template",
  ctaHref: "/book-demo",
};

export const PILOT_IMPLEMENTATION_SKU = {
  sku: "PILOT-IMPL-001",
  name: "Pilot implementation (one-time)",
  rangeLabel: "$2,000–8,000",
  notes: "Menu import, channel wiring, staff training — scoped in SOW",
} as const;

export const ALL_PILOT_PRICING_SKUS: PilotPricingSku[] = [
  DESIGN_PARTNER_LOI_SKU,
  ...PILOT_SUBSCRIPTION_SKUS,
  PAID_PILOT_PLATFORM_SKU,
];

export const PILOT_PRICING_HONEST_DISCLAIMER =
  "Pilot SKUs are contracted via LOI or SOW — not self-serve Stripe checkout yet. Self-serve 14-day trial uses standard list prices above.";
