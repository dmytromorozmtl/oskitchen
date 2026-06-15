import { describe, expect, it } from "vitest";

describe("stripe live payment intent", () => {
  it("returns config error when stripe is not configured", async () => {
    const original = process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_SECRET_KEY;

    const { createStripeLivePaymentIntent } = await import(
      "@/services/integrations/stripe/payment-intent.service"
    );

    try {
      const result = await createStripeLivePaymentIntent({ amount: 10 });
      expect(result.ok).toBe(false);
      expect(result.message).toContain("STRIPE_SECRET_KEY");
    } finally {
      if (original) process.env.STRIPE_SECRET_KEY = original;
    }
  });
});
