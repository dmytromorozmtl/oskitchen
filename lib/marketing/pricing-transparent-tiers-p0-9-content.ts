/**
 * P0-9 — Square-parity transparent pricing tiers for /pricing.
 *
 * @see docs/pricing-transparent-tiers-p0-9.md
 */

import type { PlanKey } from "@/lib/billing/plan-registry";
import { PLAN_REGISTRY } from "@/lib/billing/plan-registry";

export const PRICING_TRANSPARENT_TIERS_P0_9_POLICY_ID =
  "p0-9-transparent-pricing-tiers-v1" as const;

export const PRICING_TRANSPARENT_TIERS_P0_9_DOC =
  "docs/pricing-transparent-tiers-p0-9.md" as const;

export const PRICING_TRANSPARENT_TIERS_P0_9_ROUTE = "/pricing" as const;

export const PRICING_TRANSPARENT_TIERS_P0_9_HEADLINE =
  "Published software prices — Square-style transparency" as const;

export const PRICING_TRANSPARENT_TIERS_P0_9_SUBLINE =
  "Every tier shows a monthly list price before signup. Card processing runs through your Stripe account — separate from software, like Square." as const;

export const PRICING_TRANSPARENT_TIERS_P0_9_SQUARE_PARITY_NOTE =
  "Square publishes partial tier pricing and leans on payments revenue. OS Kitchen publishes all four software tiers on this page — no hardware bundle required." as const;

export type TransparentPricingTierStripItem = {
  key: PlanKey;
  name: string;
  monthlyUsd: number;
  limitSummary: string;
  trialEligible: boolean;
};

function formatLimit(value: number | null, singular: string, plural: string): string {
  if (value == null) return `Unlimited ${plural}`;
  return `${value} ${value === 1 ? singular : plural}`;
}

export const TRANSPARENT_PRICING_TIER_STRIP: TransparentPricingTierStripItem[] = (
  ["STARTER", "PRO", "TEAM", "ENTERPRISE"] as const
).map((key) => {
  const plan = PLAN_REGISTRY[key];
  const locations = formatLimit(plan.limits.maxLocations, "location", "locations");
  const orders = formatLimit(plan.limits.maxOrdersPerMonth, "order/mo", "orders/mo");
  return {
    key,
    name: plan.name,
    monthlyUsd: plan.priceMonthlyUsd ?? 0,
    limitSummary: `${locations} · ${orders}`,
    trialEligible: plan.checkoutable,
  };
});

export const STRIPE_PROCESSING_DISCLOSURE = {
  headline: "Card processing is separate from software",
  body: "When you enable Stripe card checkout, processing fees are charged by Stripe on your merchant account — not bundled into OS Kitchen subscription list prices.",
  bullets: [
    "Stripe standard online rates apply (verify current Stripe pricing for your region)",
    "Optional Stripe Terminal reader (~$59 M2) — not required for web POS",
    "Marketplace commissions (Uber Eats, DoorDash, Grubhub) are charged by partners directly",
    "SMS guest notifications and formal SOC 2 attestation are not included in list prices",
  ],
} as const;

export const TRANSPARENT_PRICING_NOT_INCLUDED = [
  "Stripe card processing fees",
  "Third-party marketplace commissions",
  "Optional Stripe Terminal hardware",
  "Enterprise SSO / SCIM (contract scope)",
] as const;

export function formatTransparentTierPrice(monthlyUsd: number): string {
  return `$${monthlyUsd}`;
}

export function formatComparisonColumnHeader(name: string, monthlyUsd: number | null): string {
  if (monthlyUsd == null) return name;
  return `${name} · $${monthlyUsd}/mo`;
}

export const TRANSPARENT_PRICING_COMPARISON_HEADERS = (
  ["STARTER", "PRO", "TEAM", "ENTERPRISE"] as const
).map((key) => ({
  key,
  label: formatComparisonColumnHeader(
    PLAN_REGISTRY[key].name,
    PLAN_REGISTRY[key].priceMonthlyUsd,
  ),
}));
