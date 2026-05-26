import { afterEach, describe, expect, it } from "vitest";

import {
  getStripeCheckoutBlockReason,
  getStripeConfigState,
  isStripeCheckoutReady,
} from "@/lib/billing/stripe-config";
import { isValidStripePriceId } from "@/lib/billing/stripe-price-id";
import { hasKitchenOsStripeProductIdFallback } from "@/lib/billing/stripe-product-ids";

const ENV_KEYS = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID",
  "NEXT_PUBLIC_STRIPE_PRO_PRICE_ID",
  "NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID",
  "NEXT_PUBLIC_APP_URL",
] as const;

function snapshotEnv(): Record<string, string | undefined> {
  return Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
}

function restoreEnv(snapshot: Record<string, string | undefined>) {
  for (const k of ENV_KEYS) {
    const v = snapshot[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
}

describe("stripe checkout readiness", () => {
  const saved = snapshotEnv();

  afterEach(() => {
    restoreEnv(saved);
  });

  it("validates price id shape", () => {
    expect(isValidStripePriceId("price_123")).toBe(true);
    expect(isValidStripePriceId("prod_123")).toBe(false);
    expect(isValidStripePriceId("")).toBe(false);
  });

  it("is ready when secret, price ids, and app url exist (webhook optional)", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_abc";
    process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID = "price_starter";
    process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID = "price_pro";
    process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID = "price_team";
    process.env.NEXT_PUBLIC_APP_URL = "https://os-kitchen.com";
    delete process.env.STRIPE_WEBHOOK_SECRET;

    expect(isStripeCheckoutReady()).toBe(true);
    expect(getStripeCheckoutBlockReason()).toBeNull();
    expect(getStripeConfigState()).toBe("partially-configured");
  });

  it("treats prod_ env values as invalid but still ready via product id fallback", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_abc";
    process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID = "prod_starter";
    process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID = "price_pro";
    process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID = "price_team";
    process.env.NEXT_PUBLIC_APP_URL = "https://os-kitchen.com";

    expect(isStripeCheckoutReady()).toBe(true);
    expect(getStripeCheckoutBlockReason()).toBeNull();
  });

  it("is ready with product id fallback when price env empty but secret present", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_abc";
    delete process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID;
    delete process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
    delete process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID;
    process.env.NEXT_PUBLIC_APP_URL = "https://os-kitchen.com";

    expect(hasKitchenOsStripeProductIdFallback()).toBe(true);
    expect(isStripeCheckoutReady()).toBe(true);
    expect(getStripeCheckoutBlockReason()).toBeNull();
  });

  it("reports fully configured when webhook secret is also set", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_abc";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID = "price_starter";
    process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID = "price_pro";
    process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID = "price_team";
    process.env.NEXT_PUBLIC_APP_URL = "https://os-kitchen.com";

    expect(isStripeCheckoutReady()).toBe(true);
    expect(getStripeConfigState()).toBe("configured");
  });
});
