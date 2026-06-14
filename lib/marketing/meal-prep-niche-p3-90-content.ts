/**
 * P3-90 — Meal Prep OS niche positioning content.
 *
 * @see docs/meal-prep-niche-p3-90.md
 */

import {
  MEAL_PREP_NICHE_P3_90_BRAND,
  MEAL_PREP_NICHE_P3_90_PILLAR_IDS,
} from "@/lib/marketing/meal-prep-niche-p3-90-policy";

export type MealPrepNicheMaturity = "LIVE" | "BETA";

export type MealPrepNichePillar = {
  id: (typeof MEAL_PREP_NICHE_P3_90_PILLAR_IDS)[number];
  title: string;
  headline: string;
  description: string;
  maturity: MealPrepNicheMaturity;
  features: readonly string[];
  dashboardPath: string;
};

export const MEAL_PREP_NICHE_P3_90_TAGLINE =
  "Meal Prep OS connects native subscription cadence, production board batches, and owned-channel storefront preorders in one workspace — built for operators shipping 200+ meals per week." as const;

export const MEAL_PREP_NICHE_P3_90_HONESTY_NOTE =
  "Meal Prep OS is OS Kitchen positioned for subscription kitchens — not a separate product SKU. Native meal-plan auto-renew and storefront checkout carry honest BETA labels until GA gates pass." as const;

export const MEAL_PREP_NICHE_P3_90_PILLARS: readonly MealPrepNichePillar[] = [
  {
    id: "subscription",
    title: "Native subscriptions",
    headline: "Cadence, skip/pause, and renewals — not a WooCommerce bolt-on",
    description:
      "Meal-plan subscriptions tie weekly menus to recurring customer orders. Auto-renew, skip, and pause flows live in the Meal Prep OS dashboard with honest BETA labels.",
    maturity: "BETA",
    features: [
      "Weekly meal-plan cadence linked to menu rotation",
      "Skip/pause and auto-renew (BETA — certification in progress)",
      "Subscriber roster with cutoff-aware order generation",
      "CRM loyalty hooks for repeat pickup customers",
    ],
    dashboardPath: "/dashboard/meal-plans",
  },
  {
    id: "production",
    title: "Production board",
    headline: "Batch quantities from confirmed orders — not Sunday spreadsheets",
    description:
      "Production board rolls up confirmed preorders into batch prep by SKU. Packing lanes group by pickup window before handoff.",
    maturity: "LIVE",
    features: [
      "Weekly menu → confirmed order quantities",
      "Production board batch prep by SKU",
      "Packing lanes grouped by pickup window",
      "Ingredient demand rollup when recipes exist",
    ],
    dashboardPath: "/dashboard/production",
  },
  {
    id: "storefront",
    title: "Owned storefront",
    headline: "Preorder cutoffs on your domain — not marketplace rent",
    description:
      "Native storefront checkout with Stripe Connect when configured. Customers order on your site; kitchen runs one order hub queue.",
    maturity: "BETA",
    features: [
      "Hosted storefront with weekly menu publishing",
      "Preorder cutoff enforcement when configured",
      "Stripe checkout on owned channel (BETA until GA)",
      "Order hub → KDS → packing — same path as POS orders",
    ],
    dashboardPath: "/dashboard/storefront",
  },
] as const;

export const MEAL_PREP_NICHE_P3_90_LOOP_STEPS = [
  { step: 1, label: "Publish menu + cutoff", pillar: "storefront" as const },
  { step: 2, label: "Subscriptions + preorders confirm", pillar: "subscription" as const },
  { step: 3, label: "Production board batches", pillar: "production" as const },
  { step: 4, label: "Packing → pickup handoff", pillar: "production" as const },
] as const;

export function mealPrepNicheHasAllPillars(): boolean {
  return MEAL_PREP_NICHE_P3_90_PILLAR_IDS.every((id) =>
    MEAL_PREP_NICHE_P3_90_PILLARS.some((p) => p.id === id),
  );
}

export function mealPrepNichePillarById(id: MealPrepNichePillar["id"]): MealPrepNichePillar | undefined {
  return MEAL_PREP_NICHE_P3_90_PILLARS.find((p) => p.id === id);
}

export function mealPrepNicheUsesBrand(): boolean {
  return MEAL_PREP_NICHE_P3_90_TAGLINE.includes(MEAL_PREP_NICHE_P3_90_BRAND);
}
