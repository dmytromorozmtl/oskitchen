import { PLAN_REGISTRY } from "@/lib/billing/plan-registry";

/**
 * Directional competitor pricing benchmark for /pricing transparency (Task 35).
 * Sales-safe: typical ranges from public positioning — not a guarantee we beat incumbents.
 *
 * @see docs/transparent-pricing-sales-guide.md
 * @see lib/marketing/pricing-transparency-absolute-final-policy.ts
 */

export const PRICING_COMPETITOR_BENCHMARK_POLICY_ID =
  "pricing-transparency-absolute-final-v1" as const;

export const PRICING_COMPETITOR_BENCHMARK_COMPETITORS = [
  "Toast",
  "Square",
  "Lightspeed",
  "TouchBistro",
] as const;

export type PricingCompetitorBenchmarkCompetitor =
  (typeof PRICING_COMPETITOR_BENCHMARK_COMPETITORS)[number];

export type PricingCompetitorBenchmarkRow = {
  dimension: string;
  toast: string;
  square: string;
  lightspeed: string;
  touchbistro: string;
  osKitchen: string;
};

export const PRICING_COMPETITOR_BENCHMARK_DISCLAIMER =
  "Directional comparison from public vendor positioning (June 2026). Verify current quotes before customer conversations — competitor pricing and bundles change." as const;

export const PRICING_COMPETITOR_BENCHMARK_METHODOLOGY =
  "OS Kitchen prices read from PLAN_REGISTRY (single source of truth). Competitor cells are illustrative ranges from websites, sales decks, and battle cards — not audited invoices." as const;

/** Published OS Kitchen list prices — always derived from plan registry. */
export function getPublishedOsKitchenPlanPrices() {
  return {
    starter: PLAN_REGISTRY.STARTER.priceMonthlyUsd ?? 0,
    pro: PLAN_REGISTRY.PRO.priceMonthlyUsd ?? 0,
    team: PLAN_REGISTRY.TEAM.priceMonthlyUsd ?? 0,
    enterprise: PLAN_REGISTRY.ENTERPRISE.priceMonthlyUsd,
  };
}

export function formatPublishedOsKitchenPriceRange(): string {
  const { starter, pro, team, enterprise } = getPublishedOsKitchenPlanPrices();
  const enterpriseLabel = enterprise != null ? `$${enterprise}` : "Contact sales";
  return `$${starter}–$${team}/mo published (Enterprise ${enterpriseLabel})`;
}

export function buildPricingCompetitorBenchmarkRows(): PricingCompetitorBenchmarkRow[] {
  const { starter, pro, team, enterprise } = getPublishedOsKitchenPlanPrices();
  const enterpriseLabel = enterprise != null ? `$${enterprise}/mo list` : "Contact sales";

  return [
    {
      dimension: "Published software price",
      toast: "Often bundled with hardware; contact sales common",
      square: "Free tier + paid add-ons ($60+/mo typical)",
      lightspeed: "Tiered — contact sales for multi-site",
      touchbistro: "From ~$69/mo (public tiers vary)",
      osKitchen: `Starter $${starter} · Pro $${pro} · Team $${team} · Enterprise ${enterpriseLabel}`,
    },
    {
      dimension: "Required proprietary hardware",
      toast: "Toast Go / Station (~$799+ upfront typical)",
      square: "Square Terminal / Reader (~$299+ optional)",
      lightspeed: "Partner hardware bundles",
      touchbistro: "iPad-first; optional hardware kits",
      osKitchen: "$0 required — BYOD tablet / browser POS",
    },
    {
      dimension: "Software contract",
      toast: "Often multi-year with hardware",
      square: "Month-to-month software common",
      lightspeed: "Annual contracts at scale",
      touchbistro: "Month-to-month typical",
      osKitchen: "Month-to-month · cancel anytime",
    },
    {
      dimension: "Full price list on website",
      toast: "Partial — bundle pricing common",
      square: "Partial — payments-led positioning",
      lightspeed: "Contact sales for enterprise",
      touchbistro: "Partial — tiered public pages",
      osKitchen: "Full list at /pricing (this page)",
    },
    {
      dimension: "Card processing",
      toast: "Bundled Toast Payments",
      square: "Square processing rates",
      lightspeed: "Payments partners / bundled",
      touchbistro: "Integrated payments bundle",
      osKitchen: "Stripe Connect — separate from software",
    },
    {
      dimension: "Multi-location reporting",
      toast: "Enterprise tier typical",
      square: "Add-ons / higher tiers",
      lightspeed: "Included at higher tiers",
      touchbistro: "Add-on modules",
      osKitchen: "Included Team+ (no per-location addon fee)",
    },
  ];
}

export const PRICING_COMPETITOR_BENCHMARK_ROWS = buildPricingCompetitorBenchmarkRows();

export const PRICING_TRANSPARENCY_REQUIRED_PLAN_PRICES = {
  STARTER: 49,
  PRO: 79,
  TEAM: 199,
  ENTERPRISE: 499,
} as const;
