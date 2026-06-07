import type { PlanKey } from "@/lib/billing/plan-registry";
import { PLAN_REGISTRY } from "@/lib/billing/plan-registry";

/** Single source of truth for /pricing — synced from PLAN_REGISTRY (verified June 2026). */
export const PUBLIC_PRICING_SOURCE = "PLAN_REGISTRY" as const;

export const PUBLIC_PRICING_LAST_VERIFIED = "2026-06-06" as const;
export const PUBLIC_PRICING_UNIVERSAL_BENEFITS = [
  "14-day free trial",
  "No credit card required",
  "Cancel anytime",
  "No hardware lock-in",
] as const;

export type PublicPlanCard = {
  key: PlanKey;
  name: string;
  monthly: number | null;
  desc: string;
  bullets: string[];
  cta: "trial" | "contact";
  featured?: boolean;
  badge?: string;
};

export const PUBLIC_PRICING_PLANS: PublicPlanCard[] = [
  {
    key: "STARTER",
    name: PLAN_REGISTRY.STARTER.name,
    monthly: PLAN_REGISTRY.STARTER.priceMonthlyUsd ?? 0,
    desc: "Single-location cafés and food trucks getting started.",
    bullets: [
      "1 location · 100 orders / month",
      "POS + KDS + basic reports",
      "Email support (4h response)",
      ...PUBLIC_PRICING_UNIVERSAL_BENEFITS,
    ],
    cta: "trial",
  },
  {
    key: "PRO",
    name: PLAN_REGISTRY.PRO.name,
    monthly: PLAN_REGISTRY.PRO.priceMonthlyUsd ?? 0,
    desc: "Growing restaurants with online sales and marketplace access.",
    bullets: [
      "1 location · 1,000 orders / month",
      "Everything in Starter",
      "WooCommerce + Shopify",
      "HoReCa marketplace access",
      "AI Daily Briefing",
      "Priority chat support",
    ],
    cta: "trial",
    featured: true,
    badge: "Most Popular",
  },
  {
    key: "TEAM",
    name: PLAN_REGISTRY.TEAM.name,
    monthly: PLAN_REGISTRY.TEAM.priceMonthlyUsd ?? 0,
    desc: "Multi-location teams with delivery marketplaces and API needs.",
    bullets: [
      "3 locations · unlimited orders",
      "Everything in Pro",
      "Staff roles + scheduling",
      "Uber Eats / DoorDash / Grubhub adapters (BETA)",
      "API access",
      "Phone support (1h response)",
    ],
    cta: "trial",
  },
  {
    key: "ENTERPRISE",
    name: PLAN_REGISTRY.ENTERPRISE.name,
    monthly: PLAN_REGISTRY.ENTERPRISE.priceMonthlyUsd,
    desc: "Franchise groups and enterprise operations with custom contracts.",
    bullets: [
      "Unlimited locations",
      "SSO + SCIM",
      "Custom integrations (scoped SOW)",
      "Dedicated account manager",
      "Contractual SLA",
    ],
    cta: "contact",
  },
];

export const PUBLIC_PRICING_COMPARE_ROWS: {
  label: string;
  s: boolean;
  p: boolean;
  t: boolean;
  e: boolean;
}[] = [
  { label: "POS + KDS", s: true, p: true, t: true, e: true },
  { label: "Basic reports", s: true, p: true, t: true, e: true },
  { label: "WooCommerce / Shopify", s: false, p: true, t: true, e: true },
  { label: "HoReCa marketplace access", s: false, p: true, t: true, e: true },
  { label: "AI Daily Briefing", s: false, p: true, t: true, e: true },
  { label: "Staff roles + scheduling", s: false, p: false, t: true, e: true },
  { label: "Uber Eats / DoorDash / Grubhub (BETA)", s: false, p: false, t: true, e: true },
  { label: "API access", s: false, p: false, t: true, e: true },
  { label: "SSO + SCIM", s: false, p: false, t: false, e: true },
  { label: "Dedicated account manager", s: false, p: false, t: false, e: true },
];

export function signupHrefForPlan(plan: PlanKey): string {
  return `/signup?plan=${plan}`;
}
