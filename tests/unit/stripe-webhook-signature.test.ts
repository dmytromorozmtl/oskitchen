import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Stripe webhook route security", () => {
  it("verifies stripe-signature via constructEvent", () => {
    const source = readFileSync(
      join(process.cwd(), "app/api/webhooks/stripe/route.ts"),
      "utf8",
    );
    expect(source).toContain("stripe.webhooks.constructEvent");
    expect(source).toContain("stripe-signature");
    expect(source).toContain("STRIPE_WEBHOOK_SECRET");
    expect(source).toMatch(/billingEvent\.findUnique.*stripeEventId/s);
  });
});
