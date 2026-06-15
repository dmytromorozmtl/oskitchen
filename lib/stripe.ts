import Stripe from "stripe";

import { getServerEnv, resolveStripePriceId } from "@/lib/env";
import { logger } from "@/lib/logger";

export function getStripe(): Stripe | null {
  try {
    const key = getServerEnv().STRIPE_SECRET_KEY;
    if (!key) {
      logger.warn("STRIPE_SECRET_KEY is not set — billing routes will be disabled.");
      return null;
    }
    return new Stripe(key, { typescript: true });
  } catch {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return null;
    return new Stripe(key, { typescript: true });
  }
}

export function getStripePriceId(plan: "STARTER" | "PRO" | "TEAM"): string {
  const id = resolveStripePriceId(plan);
  if (!id) {
    throw new Error(
      `Missing NEXT_PUBLIC_STRIPE_${plan}_PRICE_ID (or legacy env). See .env.example.`,
    );
  }
  return id;
}
