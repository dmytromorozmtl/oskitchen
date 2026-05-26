import Stripe from "stripe";

import { logger } from "@/lib/logger";
import { planDef, type PlanKey } from "@/lib/billing/plan-registry";

/**
 * Server-side Stripe client factory. Returns null when not configured —
 * callers MUST handle that path and never throw to the browser.
 */
export function getStripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return null;
  }
  return new Stripe(key, { typescript: true });
}

/**
 * Server-side price-id resolver. Reads the price id from env using the
 * plan registry. The client never supplies a price id directly.
 */
export function resolvePlanPriceId(plan: PlanKey): string | null {
  const def = planDef(plan);
  if (!def.stripePriceEnvKey) return null;
  const value = process.env[def.stripePriceEnvKey];
  if (!value || !value.startsWith("price_")) return null;
  return value;
}

/**
 * Validate that a plan is checkoutable AND has a price id. Returns the
 * resolved priceId or a structured error. Falls back to Stripe Product lookup.
 */
export async function resolveCheckoutPrice(plan: PlanKey): Promise<
  | { ok: true; priceId: string }
  | { ok: false; reason: "not_checkoutable" | "missing_price" }
> {
  const def = planDef(plan);
  if (!def.checkoutable) return { ok: false, reason: "not_checkoutable" };
  const { resolvePlanPriceIdAsync } = await import("@/lib/billing/stripe-price-resolver");
  const priceId = (await resolvePlanPriceIdAsync(plan)) ?? resolvePlanPriceId(plan);
  if (!priceId) return { ok: false, reason: "missing_price" };
  return { ok: true, priceId };
}

export function safeStripeError(e: unknown): string {
  if (e instanceof Stripe.errors.StripeError) {
    logger.warn(`[billing] stripe error: ${e.message}`);
    return e.message;
  }
  if (e instanceof Error) {
    logger.warn(`[billing] error: ${e.message}`);
    return e.message;
  }
  return "Unexpected Stripe error";
}
