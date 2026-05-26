import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildOpenApiDocument, countApiRoutes } from "@/lib/api/openapi-spec";
import {
  getStripeCheckoutBlockReason,
  isStripeCheckoutReady,
} from "@/lib/billing/stripe-config";

describe("Stripe integration (config + webhook contract)", () => {
  it("reports checkout readiness shape for test mode env", () => {
    const saved = process.env.STRIPE_SECRET_KEY;
    process.env.STRIPE_SECRET_KEY = "sk_test_integration";
    process.env.NEXT_PUBLIC_APP_URL = "https://os-kitchen.com";
    process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID = "price_test_pro";

    expect(isStripeCheckoutReady()).toBe(true);
    expect(getStripeCheckoutBlockReason()).toBeNull();

    if (saved) process.env.STRIPE_SECRET_KEY = saved;
    else delete process.env.STRIPE_SECRET_KEY;
  });

  it("webhook route verifies stripe-signature before processing", () => {
    const source = readFileSync(
      join(process.cwd(), "app/api/webhooks/stripe/route.ts"),
      "utf8",
    );
    expect(source).toContain("stripe.webhooks.constructEvent");
    expect(source).toContain("stripeEventId");
    expect(source).toMatch(/duplicate.*true|duplicate: true/s);
  });

  it("storefront checkout service creates Stripe session when configured", () => {
    const source = readFileSync(
      join(process.cwd(), "services/storefront/storefront-stripe-checkout-service.ts"),
      "utf8",
    );
    expect(source).toContain("checkout.sessions.create");
    expect(source).toContain("storefront_order");
  });
});

describe("OpenAPI manifest", () => {
  it("includes all app/api routes", () => {
    const count = countApiRoutes();
    expect(count).toBeGreaterThan(200);
    const doc = buildOpenApiDocument();
    expect(Object.keys(doc.paths as object).length).toBe(count);
  });
});
