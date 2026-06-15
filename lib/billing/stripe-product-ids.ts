import type { PlanKey } from "@/lib/billing/plan-registry";

/**
 * Live Stripe Product ids (OS Kitchen plans). Used when NEXT_PUBLIC_STRIPE_*_PRICE_ID
 * env vars are empty — server resolves default monthly Price via Stripe API.
 */
export const OS_KITCHEN_STRIPE_PRODUCT_IDS: Partial<Record<Exclude<PlanKey, "ENTERPRISE">, string>> = {
  STARTER: "prod_UXY8NOISaMt9lY",
  PRO: "prod_UXY85wJLW7Umrh",
  TEAM: "prod_UXY8wTFnxuMbLj",
};

export function getStripeProductIdForPlan(plan: PlanKey): string | null {
  if (plan === "ENTERPRISE") return null;
  const fromEnv =
    plan === "STARTER"
      ? process.env.STRIPE_STARTER_PRODUCT_ID
      : plan === "PRO"
        ? process.env.STRIPE_PRO_PRODUCT_ID
        : plan === "TEAM"
          ? process.env.STRIPE_TEAM_PRODUCT_ID
          : undefined;
  const trimmed = fromEnv?.trim();
  if (trimmed?.startsWith("prod_")) return trimmed;
  return OS_KITCHEN_STRIPE_PRODUCT_IDS[plan] ?? null;
}

export function hasKitchenOsStripeProductIdFallback(): boolean {
  return (["STARTER", "PRO", "TEAM"] as const).every((p) => Boolean(getStripeProductIdForPlan(p)));
}
