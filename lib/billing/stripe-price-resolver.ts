import { planDef, type PlanKey } from "@/lib/billing/plan-registry";
import { isValidStripePriceId } from "@/lib/billing/stripe-price-id";
import { getStripeProductIdForPlan } from "@/lib/billing/stripe-product-ids";
import { getStripeClient } from "@/lib/billing/stripe-client";

const cache = new Map<string, string>();

/** Resolve monthly `price_…` from env or Stripe Product default / first active price. */
export async function resolvePlanPriceIdAsync(plan: PlanKey): Promise<string | null> {
  const def = planDef(plan);
  if (!def.stripePriceEnvKey) return null;

  const envVal = process.env[def.stripePriceEnvKey];
  if (isValidStripePriceId(envVal)) return envVal!.trim();

  const productId = getStripeProductIdForPlan(plan);
  if (!productId) return null;

  const cached = cache.get(productId);
  if (cached) return cached;

  const stripe = getStripeClient();
  if (!stripe) return null;

  try {
    const product = await stripe.products.retrieve(productId);
    const defaultPrice = product.default_price;
    if (typeof defaultPrice === "string" && isValidStripePriceId(defaultPrice)) {
      cache.set(productId, defaultPrice);
      return defaultPrice;
    }
    if (defaultPrice && typeof defaultPrice === "object" && "id" in defaultPrice) {
      const id = String(defaultPrice.id);
      if (isValidStripePriceId(id)) {
        cache.set(productId, id);
        return id;
      }
    }

    const prices = await stripe.prices.list({ product: productId, active: true, limit: 20 });
    const monthly = prices.data.find((p) => p.recurring?.interval === "month" && isValidStripePriceId(p.id));
    if (monthly) {
      cache.set(productId, monthly.id);
      return monthly.id;
    }
  } catch {
    return null;
  }

  return null;
}
